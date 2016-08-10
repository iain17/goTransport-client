module goTransport {

    export class MessageMethodResult extends Message{
        static type = MessageType.MessageTypeMethodResult;

        constructor(private result: boolean = false, private parameters: Array<any> = null) {
            super(MessageMethodResult.type);
        }

        Sending(): Error {
            return null;
        }

        Received(previousMessage: Message): Error {
            if(!(previousMessage instanceof MessageMethod)) {
                return new Error("Invalid previousMessage. Not messageMethod.");
            }

            console.log('Result came back!', this.parameters);
            let promise = (previousMessage as MessageMethod).getPromise();
            if(promise) {
                promise.resolve.apply(promise, this.parameters);
            }

            return null;
        }

        public GetResult():boolean {
            return this.result;
        }

        public GetParameters(): Array<any> {
            return this.parameters;
        }

        public toJSON() : any {
            return {
                id: this.GetId(),
                type: this.GetType(),
                result: this.GetResult(),
                parameters: this.GetParameters()
            }
        }

    }

    MessageDefinition.set(MessageMethodResult.type, MessageMethodResult);
}