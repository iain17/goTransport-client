module goTransport {

    export class MessageMethod extends Message{
        static type = MessageType.MessageTypeMethod;
        private promise : Promise;

        constructor(public name: string = null, public parameters: Array<any> = null) {
            super(MessageMethod.type);
        }

        Sending(): Error {
            this.promise = new Promise();
            return null;
        }

        Received(previousMessage: Message): Error {
            console.log('Received request to call a method', this.name);
            let method = this.GetSession().GetClient().getMethod(this.name);

            if(method != null) {
                let result = [
                    method.apply(this, this.parameters)
                ];
                console.debug('replying back with result:', result);
                this.Reply(new MessageMethodResult(true, result));
            }
            return null;
        }

        public getPromise(): Promise {
            return this.promise;
        }

        public GetName():string {
            return this.name;
        }

        public GetParameters():Array<any> {
            return this.parameters;
        }

        public toJSON() : any {
            return {
                id: this.GetId(),
                type: this.GetType(),
                name: this.GetName(),
                parameters: this.GetParameters()
            }
        }

    }

    MessageDefinition.set(MessageMethod.type, MessageMethod);
}