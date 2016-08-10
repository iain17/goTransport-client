module Socket {

    export interface SocketDelegate {
        connected(): void;
        messaged(data: string): void;
        disconnected(code: number, reason: string, wasClean: boolean): void;
    }

    export interface Socket {
        connect(url:string):void;
        send(data:string):void;
        close():void;
    }

    export class Adapter {
        static getSocket(type: string, delegate: Socket.SocketDelegate):Socket.Socket {
            switch(type) {

                case "SockJSClient":
                    return SockJSClient.getInstance(delegate);
                default:
                    throw("Invalid socket type:"+type)
            }
        }
    }

}