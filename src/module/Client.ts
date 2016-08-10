module goTransport {
    import IPromise = goTransport.IPromise;

    export abstract class Client {

        protected static instance: Client;
        private session : Session;
        private methods: { [name: string] : Function; } = {};

        constructor() {
            Client.instance = this;
            this.session = new Session(this);
        }

        public connect(url : string): IPromise<{}> {
            return this.session.connect(url);
        }

        public call(name: string, parameters: any[], timeout: number = 3000): IPromise<{}> {
            let message = new MessageMethod(name, parameters);
            message.Initialize(this.session);
            Message.send(message);
            var promise = message.getPromise();
            promise.setTimeOut(timeout);
            return promise.promise;
        }

        public method(name: string, method: Function) {
            this.methods[name] = method;
        }

        public getMethod(name:string): Function {
            return this.methods[name];
        }

        public onConnect(): IPromise<{}> {
            return this.session.getConnectedPromise();
        }

    }
}