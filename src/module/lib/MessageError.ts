module goTransport {

    export class MessageError extends Message{
        static type = MessageType.MessageTypeError;
        private promise : Promise;
        private reason:string;

        constructor(reason: Error) {
            this.reason = reason.message;
            super(MessageError.type);
        }

        public GetReason():string {
            return this.reason;
        }

        Sending(): Error {
            return null;
        }

        Received(previousMessage: Message): Error {
            console.error(this.reason);

            //TODO: On error method maybe?
            if((previousMessage instanceof MessageMethod)) {
                let promise = (previousMessage as MessageMethod).getPromise();
                if(promise) {
                    promise.reject(this.reason);
                }
            }
            return null;
        }

        public toJSON() : any {
            return {
                id: this.GetId(),
                type: this.GetType(),
                reason: this.GetReason()
            }
        }
    }

    MessageDefinition.set(MessageError.type, MessageError);
}