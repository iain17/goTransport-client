module goTransport {
    export class MessageBuilder<T extends Message> {
        constructor(private messageType:any) {
            
        }

        build() : T {
            return new this.messageType();
        }
    }
}