module goTransport {
    export enum MessageType {
        MessageTypeTest,
        MessageTypeMethod,
        MessageTypeMethodResult,
        MessageTypeError
    }
    
    export class MessageDefinition{
        private static definitions = Array<any>();

        public static set(type : MessageType, definition : any) {
            if(!definition || !definition.prototype) {
                console.warn("Invalid message definition set for type", type);
                return
            }
            // console.debug('message def: set', type, definition);
            MessageDefinition.definitions[type] = definition;
        }

        public static get(type : MessageType, data : string) : Message {
            let definition = MessageDefinition.definitions[type];
            // console.debug('message def: get', type, data, definition);
            if(definition === undefined) {
                console.warn("Invalid messageType requested", type);
                return null;
            }
            
            let messageBuilder = new MessageBuilder<definition>(definition);
            var message = messageBuilder.build();
            (Object as any).assign(message, JSON.parse(data), {
                // convert fields that need converting
            });
            return message;

        }

    }

}