//Sick and tired of the sockJS typings. Can't get it to work, so any type will do.
declare var SockJS: any;

module Socket {
    export class SockJSClient implements Socket {
        private static instance:SockJSClient;
        private connection:any;//SockJSClass
        private delegate:Socket.SocketDelegate;

        //Should be a private constructor: https://github.com/Microsoft/TypeScript/issues/2341
        constructor(url:string, delegate:Socket.SocketDelegate) {
            this.delegate = delegate;
            this.connection = new SockJS(url);
            this.connection.onopen = this.open.bind(this);
            this.connection.onclose = this.disconnect.bind(this);
            this.connection.onmessage = this.message.bind(this);
        }

        public static getInstance(url:string, delegate:Socket.SocketDelegate):Socket.Socket {
            if (!SockJSClient.instance) {
                SockJSClient.instance = new SockJSClient(url, delegate);
            }
            return SockJSClient.instance;
        }

        private open(e:any) {//__SockJSClient.OpenEvent
            this.delegate.connected()
        }

        private disconnect(e:any) {//__SockJSClient.CloseEvent
            this.delegate.disconnected(e.code, e.reason, e.wasClean)
        }

        private message(e:any) {//__SockJSClient.MessageEvent
            this.delegate.messaged(e.data)
        }

        send(data:string) {
            this.connection.send(data);
        }

        close() {
            this.connection.close();
        }

    }
}