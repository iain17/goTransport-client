module goTransport {

    interface IDeferred<T> {
        resolve(value?: T|IPromise<T>): void;
        reject(reason?: any): void;
        notify(state?: any): void;
        promise: IPromise<T>;
    }

    export interface IPromise<T> {
        then<TResult>(successCallback: (promiseValue: T) => IPromise<TResult>|TResult, errorCallback?: (reason: any) => any, notifyCallback?: (state: any) => any): IPromise<TResult>;
        catch<TResult>(onRejected: (reason: any) => IPromise<TResult>|TResult): IPromise<TResult>;
        finally(finallyCallback: () => any): IPromise<T>;
        $$state:any;
    }

    export interface IQService {
        defer<T>(): IDeferred<T>;
    }

    //Angular promises don't time out and later on I also want to support other frameworks. So this class just wraps a kriskowal Q promise dependency and adds on it a simple time out.
    export class Promise implements IDeferred<{}>{
        defer : IDeferred<{}>;
        promise : IPromise<{}>;

        public static $q: IQService;
        private timer: number;

        constructor(private timeout: number = 0) {
            this.defer = Promise.$q.defer();
            this.promise = this.defer.promise;
            this.setTimeOut(timeout);
        }

        resolve(value?:IPromise<{}>|{}):void {
            this.defer.resolve(value);
        }

        reject(reason?:any):void {
            this.defer.reject(reason);
        }

        notify(state?:any):void {
            this.defer.notify(state);
        }

        public setTimeOut(timeout: number = 3000) {
            this.timeout = timeout;
            if(this.timer)
                clearTimeout(this.timer);
            if(timeout > 0) {
                this.timer = setTimeout(this.timedOut.bind(this), timeout);
            }
        }

        private timedOut() {
            if(this.promise.$$state.status == 0) {//Pending
                this.defer.reject("Timed out. Exceeded:"+this.timeout);
            }
        }
    }
}