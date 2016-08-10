module goTransport {

    export abstract class Message{
        id:number;
        protected previousMessage: Message;
        private static headerDelimiter = "\f";
        private session : Session;

        constructor(private type : MessageType) {
            this.id = null;
        }

        public Initialize(session : Session) {
            this.session = session;

            if(this.GetId() > session.GetCurrentId()) {
                session.SetCurrentId(this.GetId())
            }
        }

        public GetId():number {
            return this.id;
        }

        public SetId(id : number) {
            this.id = id;
        }

        public GetSession(): Session {
            return this.session;
        }

        public GetType():MessageType {
            return this.type;
        }

        public setPreviousMessage(message: Message) {
            this.previousMessage = message;
        }

        //Sending the message.
        abstract Sending(): Error

        //Received the message.
        abstract Received(): Error

        // toJSON is automatically used by JSON.stringify
        static serialize(message : Message): string {
            // copy all fields from `this` to an empty object and return in
            return message.GetType() + Message.headerDelimiter + JSON.stringify(message);
        }

        static unSerialize(data : string) : Message {
            var parts = data.split(Message.headerDelimiter);
            if(parts[1] === undefined) {
                console.warn("Invalid message. Invalid amount of parts", data);
                return null;
            }
            // console.log(parts);
            return MessageDefinition.get(parseInt(parts[0]), parts[1]);
        }

        public toJSON():any {
            // return (Object as any).assign({}, this, {
            //     // convert fields that need converting
            // });
            return {
                id: this.GetId(),
                type: this.GetType()
            }
        }

        public Reply(replyMessage : Message) {
            if(this.GetSession() == null) {
                console.debug("MessageType %d has not been initialized.", this.GetType());
                return
            }

            replyMessage.SetId(this.GetId());
            replyMessage.Sending();
            this.session.setPreviousMessage(replyMessage);
            this.session.Send(Message.serialize(replyMessage));
        }

        static send(message : Message) {
            if(message.GetSession == null) {
                console.debug("MessageType %d has not been initialized.", message.GetType())
                return
            }

            let session = message.GetSession();
            session.IncrementCurrentId();
            message.SetId(session.GetCurrentId());
            message.Sending();
            session.setPreviousMessage(message);
            session.Send(Message.serialize(message));
        }

    }
}