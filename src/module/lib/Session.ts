module goTransport {
    import SocketDelegate = Socket.SocketDelegate;

    export class Session implements SocketDelegate{
        public socket: Socket.Socket;
        private messages : Array<Message>;
        private connectedPromise : Promise;
        private currentId = 0;
        private client : Client;

        constructor(client : Client) {
            this.messages = [];
            this.client = client;
        }

        public GetCurrentId(): number {
            return this.currentId
        }

        public GetClient(): Client {
            return this.client;
        }

        public SetCurrentId(id:number) {
            this.currentId = id
        }

        public IncrementCurrentId() {
            this.currentId++
        }

        public connect(url : string): IPromise<{}> {
            this.connectedPromise = new Promise();
            if(this.socket == null) {
                this.socket = Socket.Adapter.getSocket("SockJSClient", url, this);
            }
            return this.getConnectedPromise();
        }

        public getConnectedPromise():IPromise<{}> {
            return this.connectedPromise.promise;
        }

        public setPreviousMessage(message: Message) {
            console.log('messageManager', 'setPreviousMessage', message.id);
            this.messages[message.id] = message;
        }

        private getPreviousMessage(message: Message): Message {
            console.log('messageManager', 'getPreviousMessage', message.id, this.messages[message.id]);
            return this.messages[message.id];
        }

        connected() {
            console.log('connected');
            this.connectedPromise.resolve();
        }

        //Send the message to the server
        public Send(message : string) {
            this.getConnectedPromise().then(function() {
                this.socket.send(message);
                console.log('sent', message);
            }.bind(this));
        }

        //Receive a message from the server
        messaged(data:string) {
            console.debug('received', data);

            let message = Message.unSerialize(data);
            message.Initialize(this);
            if(!message) {
                console.warn("Invalid message received.");
                return;
            }

            //Set the previous message that was sent for this message id.
            message.setPreviousMessage(this.getPreviousMessage(message));
            var error = message.Received();
            if (error != null) {
                console.error(error);
            }
            
        }

        //On disconnect
        //TODO: Reconnect?
        disconnected(code:number, reason:string, wasClean:boolean) {
            console.warn('Disconnected', code)
        }

    }

}