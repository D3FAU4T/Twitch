import ChatMessages from "../api/ChatMessages";
import Conduits from "../api/Conduits";
import EventSubSubscription from "../api/EventSubSubscription";
import Shards from "../api/Shards";
import type { EventSubNotification } from "../types/EventSub";
import type { Creds } from "../types/Generic";
import type { Subscription } from "../types/Subscriptions";
import EventSub from "./EventSub";

type ChatEventType =
    | "channel.chat.clear"
    | "channel.chat.clear_user_messages"
    | "channel.chat.message"
    | "channel.chat.message_delete"
    | "channel.chat.notification"
    | "channel.chat_settings.update"
    | "channel.chat.user_message_hold"
    | "channel.chat.user_message_update";

const CHAT_EVENT_TYPES = new Set<ChatEventType>([
    "channel.chat.clear",
    "channel.chat.clear_user_messages",
    "channel.chat.message",
    "channel.chat.message_delete",
    "channel.chat.notification",
    "channel.chat_settings.update",
    "channel.chat.user_message_hold",
    "channel.chat.user_message_update",
]);

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
type ManualSubscriptionInput = DistributiveOmit<Subscription, "transport">;
type ExistingSubscription = Awaited<ReturnType<typeof EventSubSubscription.get>>["data"][number];

export interface ClientOptions {
    clientId: string;
    accessToken: string;
    userId: string;
    broadcasterUserId: string;
    shardCount?: number;
}

export default class Client {
    private readonly eventSub = new EventSub();
    private readonly options: ClientOptions;
    private readonly registeredEvents = new Set<Subscription["type"]>();
    private readonly manualSubscriptions: ManualSubscriptionInput[] = [];

    private conduitId: string | null = null;
    private isInitialized = false;

    constructor(options: ClientOptions) {
        this.options = options;
    }

    public async connect(): Promise<void> {
        if (this.isInitialized)
            return;

        const conduitId = await this.ensureConduit();
        this.conduitId = conduitId;

        const sessionId = await this.eventSub.connect();
        await this.ensureShard(conduitId, sessionId);
        await this.ensureSubscriptions(conduitId);

        this.isInitialized = true;
    }

    public close(): void {
        this.eventSub.close();
        this.isInitialized = false;
    }

    public on<T extends Subscription["type"]>(event: T, handler: (notification: EventSubNotification<T>) => void): this {
        this.registeredEvents.add(event);
        this.eventSub.on(event, handler);

        if (this.isInitialized && this.conduitId && this.isChatEventType(event)) {
            void this.ensureSubscriptionForEvent(this.conduitId, event).catch((error) => {
                console.error(`Failed to ensure subscription for '${event}'`, error);
            });
        }

        return this;
    }

    public async subscribe(subscription: ManualSubscriptionInput): Promise<this> {
        if (!this.isInitialized || !this.conduitId) {
            this.manualSubscriptions.push(subscription);
            return this;
        }

        await this.ensureSubscription(
            this.buildConduitSubscription(subscription, this.conduitId),
            await this.fetchExistingSubscriptions()
        );

        return this;
    }

    public off(event: Subscription["type"]): this {
        this.registeredEvents.delete(event);
        this.eventSub.off(event);
        return this;
    }

    public async say(message: string): Promise<string> {
        const result = await ChatMessages.send(this.creds, {
            broadcaster_id: this.options.broadcasterUserId,
            sender_id: this.options.userId,
            message,
        });
        return result.message_id;
    }

    public async reply(parentMessageId: string, message: string): Promise<string> {
        const result = await ChatMessages.send(this.creds, {
            broadcaster_id: this.options.broadcasterUserId,
            sender_id: this.options.userId,
            message,
            reply_parent_message_id: parentMessageId,
        });
        return result.message_id;
    }

    private async ensureConduit(): Promise<string> {
        const conduits = await Conduits.get(this.creds);
        const existingConduit = conduits[0];

        if (existingConduit)
            return existingConduit.id;

        const created = await Conduits.create({
            ...this.creds,
            shard_count: this.options.shardCount ?? 1,
        });

        const createdConduit = created[0];
        if (!createdConduit)
            throw new Error("Failed to create conduit.");

        return createdConduit.id;
    }

    private async ensureShard(conduitId: string, sessionId: string): Promise<void> {
        const shards = await Shards.get({
            ...this.creds,
            conduit_id: conduitId,
        });

        const shard0 = shards.data.find((shard) => shard.id === "0");
        const hasCorrectTransport =
            shard0?.transport.method === "websocket" && shard0.transport.session_id === sessionId;

        if (shard0?.status === "enabled" && hasCorrectTransport)
            return;

        await Shards.update({
            ...this.creds,
            conduit_id: conduitId,
            shards: [
                {
                    id: "0",
                    transport: {
                        method: "websocket",
                        session_id: sessionId,
                    },
                },
            ],
        });
    }

    private async ensureSubscriptions(conduitId: string): Promise<void> {
        const existingSubscriptions = await this.fetchExistingSubscriptions();

        for (const event of this.registeredEvents) {
            if (!this.isChatEventType(event))
                continue;

            await this.ensureSubscriptionForEvent(conduitId, event, existingSubscriptions);
        }

        for (const subscription of this.manualSubscriptions)
            await this.ensureSubscription(
                this.buildConduitSubscription(subscription, conduitId),
                existingSubscriptions
            );
    }

    private async ensureSubscriptionForEvent(
        conduitId: string,
        event: Subscription["type"],
        existingSubscriptions?: ExistingSubscription[]
    ): Promise<void> {
        await this.ensureSubscription(this.buildSubscription(event, conduitId), existingSubscriptions);
    }

    private buildSubscription(event: Subscription["type"], conduitId: string): Subscription {
        if (!this.isChatEventType(event)) {
            throw new Error(
                `Event '${event}' is not auto-configurable with current Client options. Use client.subscribe(...) for non-chat subscriptions.`
            );
        }

        return {
            type: event,
            version: "1",
            transport: {
                method: "conduit",
                conduit_id: conduitId,
            },
            condition: {
                broadcaster_user_id: this.options.broadcasterUserId,
                user_id: this.options.userId,
            },
        };
    }

    private buildConduitSubscription(subscription: ManualSubscriptionInput, conduitId: string): Subscription {
        return {
            ...subscription,
            transport: {
                method: "conduit",
                conduit_id: conduitId,
            },
        } as Subscription;
    }

    private get creds(): Creds {
        return {
            clientId: this.options.clientId,
            accessToken: this.options.accessToken,
        };
    }

    private async fetchExistingSubscriptions(): Promise<ExistingSubscription[]> {
        return (await EventSubSubscription.get(this.creds)).data;
    }

    private async ensureSubscription(
        subscriptionDefinition: Subscription,
        existingSubscriptions?: ExistingSubscription[]
    ): Promise<void> {
        const subscriptions = existingSubscriptions ?? (await this.fetchExistingSubscriptions());

        if (subscriptions.some((subscription) => this.isSameSubscriptionDefinition(subscription, subscriptionDefinition)))
            return;

        const created = await EventSubSubscription.create(this.creds, subscriptionDefinition);

        if (existingSubscriptions)
            existingSubscriptions.push(...created.data);
    }

    private isChatEventType(event: Subscription["type"]): event is ChatEventType {
        return CHAT_EVENT_TYPES.has(event as ChatEventType);
    }

    private isSameSubscriptionDefinition(
        existing: ExistingSubscription,
        expected: Subscription
    ): boolean {
        if (existing.type !== expected.type || existing.version !== expected.version)
            return false;

        if (existing.transport.method !== "conduit")
            return false;

        if (expected.transport.method !== "conduit")
            return false;

        if (existing.transport.conduit_id !== expected.transport.conduit_id)
            return false;

        return this.isSameCondition(existing.condition as Record<string, unknown>, expected.condition as Record<string, unknown>);
    }

    private isSameCondition(left: Record<string, unknown>, right: Record<string, unknown>): boolean {
        const leftEntries = Object.entries(left);

        if (leftEntries.length !== Object.keys(right).length)
            return false;

        return leftEntries.every(([key, value]) => right[key] === value);
    }
}