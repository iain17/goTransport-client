var goTransport;
(function (goTransport) {
    var Client = (function () {
        function Client() {
            this.methods = {};
            Client.instance = this;
            this.session = new goTransport.Session(this);
        }
        Client.prototype.connect = function (url) {
            return this.session.connect(url);
        };
        Client.prototype.call = function (name, parameters, timeout) {
            if (timeout === void 0) { timeout = 3000; }
            var message = new goTransport.MessageMethod(name, parameters);
            message.Initialize(this.session);
            goTransport.Message.send(message);
            var promise = message.getPromise();
            promise.setTimeOut(timeout);
            return promise.promise;
        };
        Client.prototype.method = function (name, method) {
            this.methods[name] = method;
        };
        Client.prototype.getMethod = function (name) {
            return this.methods[name];
        };
        Client.prototype.onConnect = function () {
            return this.session.getConnectedPromise();
        };
        return Client;
    }());
    goTransport.Client = Client;
})(goTransport || (goTransport = {}));
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var goTransport;
(function (goTransport) {
    "use strict";
    var Angular1 = (function (_super) {
        __extends(Angular1, _super);
        function Angular1($q) {
            goTransport.Promise.$q = $q;
            _super.call(this);
        }
        Angular1.getInstance = function ($q) {
            if (!Angular1.instance)
                Angular1.instance = new Angular1($q);
            return Angular1.instance;
        };
        return Angular1;
    }(goTransport.Client));
    goTransport.Angular1 = Angular1;
    "use strict";
    angular
        .module("goTransport", []);
    angular
        .module("goTransport")
        .factory("goTransport", ["$q", Angular1.getInstance]);
})(goTransport || (goTransport = {}));
var goTransport;
(function (goTransport) {
    var Promise = (function () {
        function Promise(timeout) {
            if (timeout === void 0) { timeout = 0; }
            this.timeout = timeout;
            this.defer = Promise.$q.defer();
            this.promise = this.defer.promise;
            this.setTimeOut(timeout);
        }
        Promise.prototype.resolve = function (value) {
            this.defer.resolve(value);
        };
        Promise.prototype.reject = function (reason) {
            this.defer.reject(reason);
        };
        Promise.prototype.notify = function (state) {
            this.defer.notify(state);
        };
        Promise.prototype.setTimeOut = function (timeout) {
            if (timeout === void 0) { timeout = 3000; }
            this.timeout = timeout;
            if (this.timer)
                clearTimeout(this.timer);
            if (timeout > 0) {
                this.timer = setTimeout(this.timedOut.bind(this), timeout);
            }
        };
        Promise.prototype.timedOut = function () {
            if (this.promise.$$state.status == 0) {
                this.defer.reject("Timed out. Exceeded:" + this.timeout);
            }
        };
        return Promise;
    }());
    goTransport.Promise = Promise;
})(goTransport || (goTransport = {}));
var goTransport;
(function (goTransport) {
    var Message = (function () {
        function Message(type) {
            this.type = type;
            this.id = null;
        }
        Message.prototype.Initialize = function (session) {
            this.session = session;
            if (this.GetId() > session.GetCurrentId()) {
                session.SetCurrentId(this.GetId());
            }
        };
        Message.prototype.GetId = function () {
            return this.id;
        };
        Message.prototype.SetId = function (id) {
            this.id = id;
        };
        Message.prototype.GetSession = function () {
            return this.session;
        };
        Message.prototype.GetType = function () {
            return this.type;
        };
        Message.serialize = function (message) {
            return message.GetType() + Message.headerDelimiter + JSON.stringify(message);
        };
        Message.unSerialize = function (data) {
            var parts = data.split(Message.headerDelimiter);
            if (parts[1] === undefined) {
                console.warn("Invalid message. Invalid amount of parts", data);
                return null;
            }
            return goTransport.MessageDefinition.get(parseInt(parts[0]), parts[1]);
        };
        Message.prototype.toJSON = function () {
            return {
                id: this.GetId(),
                type: this.GetType()
            };
        };
        Message.prototype.Reply = function (replyMessage) {
            if (this.GetSession() == null) {
                console.debug("MessageType %d has not been initialized.", this.GetType());
                return;
            }
            replyMessage.SetId(this.GetId());
            replyMessage.Sending();
            this.session.setPreviousMessage(replyMessage);
            this.session.Send(Message.serialize(replyMessage));
        };
        Message.send = function (message) {
            if (message.GetSession == null) {
                console.debug("MessageType %d has not been initialized.", message.GetType());
                return;
            }
            var session = message.GetSession();
            session.IncrementCurrentId();
            message.SetId(session.GetCurrentId());
            message.Sending();
            session.setPreviousMessage(message);
            session.Send(Message.serialize(message));
        };
        Message.headerDelimiter = "\f";
        return Message;
    }());
    goTransport.Message = Message;
})(goTransport || (goTransport = {}));
var goTransport;
(function (goTransport) {
    var MessageBuilder = (function () {
        function MessageBuilder(messageType) {
            this.messageType = messageType;
        }
        MessageBuilder.prototype.build = function () {
            return new this.messageType();
        };
        return MessageBuilder;
    }());
    goTransport.MessageBuilder = MessageBuilder;
})(goTransport || (goTransport = {}));
var goTransport;
(function (goTransport) {
    (function (MessageType) {
        MessageType[MessageType["MessageTypeTest"] = 0] = "MessageTypeTest";
        MessageType[MessageType["MessageTypeMethod"] = 1] = "MessageTypeMethod";
        MessageType[MessageType["MessageTypeMethodResult"] = 2] = "MessageTypeMethodResult";
        MessageType[MessageType["MessageTypeError"] = 3] = "MessageTypeError";
    })(goTransport.MessageType || (goTransport.MessageType = {}));
    var MessageType = goTransport.MessageType;
    var MessageDefinition = (function () {
        function MessageDefinition() {
        }
        MessageDefinition.set = function (type, definition) {
            if (!definition || !definition.prototype) {
                console.warn("Invalid message definition set for type", type);
                return;
            }
            MessageDefinition.definitions[type] = definition;
        };
        MessageDefinition.get = function (type, data) {
            var definition = MessageDefinition.definitions[type];
            if (definition === undefined) {
                console.warn("Invalid messageType requested", type);
                return null;
            }
            var messageBuilder = new goTransport.MessageBuilder(definition);
            var message = messageBuilder.build();
            Object.assign(message, JSON.parse(data), {});
            return message;
        };
        MessageDefinition.definitions = Array();
        return MessageDefinition;
    }());
    goTransport.MessageDefinition = MessageDefinition;
})(goTransport || (goTransport = {}));
var goTransport;
(function (goTransport) {
    var MessageError = (function (_super) {
        __extends(MessageError, _super);
        function MessageError(reason) {
            this.reason = reason.message;
            _super.call(this, MessageError.type);
        }
        MessageError.prototype.GetReason = function () {
            return this.reason;
        };
        MessageError.prototype.Sending = function () {
            return null;
        };
        MessageError.prototype.Received = function (previousMessage) {
            console.error(this.reason);
            if ((previousMessage instanceof goTransport.MessageMethod)) {
                var promise = previousMessage.getPromise();
                if (promise) {
                    promise.reject(this.reason);
                }
            }
            return null;
        };
        MessageError.prototype.toJSON = function () {
            return {
                id: this.GetId(),
                type: this.GetType(),
                reason: this.GetReason()
            };
        };
        MessageError.type = goTransport.MessageType.MessageTypeError;
        return MessageError;
    }(goTransport.Message));
    goTransport.MessageError = MessageError;
    goTransport.MessageDefinition.set(MessageError.type, MessageError);
})(goTransport || (goTransport = {}));
var goTransport;
(function (goTransport) {
    var MessageMethod = (function (_super) {
        __extends(MessageMethod, _super);
        function MessageMethod(name, parameters) {
            if (name === void 0) { name = null; }
            if (parameters === void 0) { parameters = null; }
            _super.call(this, MessageMethod.type);
            this.name = name;
            this.parameters = parameters;
        }
        MessageMethod.prototype.Sending = function () {
            this.promise = new goTransport.Promise();
            return null;
        };
        MessageMethod.prototype.Received = function (previousMessage) {
            console.log('Received request to call a method', this.name);
            var method = this.GetSession().GetClient().getMethod(this.name);
            if (method != null) {
                this.Reply(new goTransport.MessageMethodResult(true, [
                    method.apply(this, this.parameters)
                ]));
            }
            return null;
        };
        MessageMethod.prototype.getPromise = function () {
            return this.promise;
        };
        MessageMethod.prototype.GetName = function () {
            return this.name;
        };
        MessageMethod.prototype.GetParameters = function () {
            return this.parameters;
        };
        MessageMethod.prototype.toJSON = function () {
            return {
                id: this.GetId(),
                type: this.GetType(),
                name: this.GetName(),
                parameters: this.GetParameters()
            };
        };
        MessageMethod.type = goTransport.MessageType.MessageTypeMethod;
        return MessageMethod;
    }(goTransport.Message));
    goTransport.MessageMethod = MessageMethod;
    goTransport.MessageDefinition.set(MessageMethod.type, MessageMethod);
})(goTransport || (goTransport = {}));
var goTransport;
(function (goTransport) {
    var MessageMethodResult = (function (_super) {
        __extends(MessageMethodResult, _super);
        function MessageMethodResult(result, parameters) {
            if (result === void 0) { result = false; }
            if (parameters === void 0) { parameters = null; }
            _super.call(this, MessageMethodResult.type);
            this.result = result;
            this.parameters = parameters;
        }
        MessageMethodResult.prototype.Sending = function () {
            return null;
        };
        MessageMethodResult.prototype.Received = function (previousMessage) {
            if (!(previousMessage instanceof goTransport.MessageMethod)) {
                return new Error("Invalid previousMessage. Not messageMethod.");
            }
            console.log('Result came back!', this.parameters);
            var promise = previousMessage.getPromise();
            if (promise) {
                promise.resolve.apply(promise, this.parameters);
            }
            return null;
        };
        MessageMethodResult.prototype.GetResult = function () {
            return this.result;
        };
        MessageMethodResult.prototype.GetParameters = function () {
            return this.parameters;
        };
        MessageMethodResult.prototype.toJSON = function () {
            return {
                id: this.GetId(),
                type: this.GetType(),
                result: this.GetResult(),
                parameters: this.GetParameters()
            };
        };
        MessageMethodResult.type = goTransport.MessageType.MessageTypeMethodResult;
        return MessageMethodResult;
    }(goTransport.Message));
    goTransport.MessageMethodResult = MessageMethodResult;
    goTransport.MessageDefinition.set(MessageMethodResult.type, MessageMethodResult);
})(goTransport || (goTransport = {}));
var goTransport;
(function (goTransport) {
    var Session = (function () {
        function Session(client) {
            this.currentId = 0;
            this.messages = [];
            this.client = client;
        }
        Session.prototype.GetCurrentId = function () {
            return this.currentId;
        };
        Session.prototype.GetClient = function () {
            return this.client;
        };
        Session.prototype.SetCurrentId = function (id) {
            this.currentId = id;
        };
        Session.prototype.IncrementCurrentId = function () {
            this.currentId++;
        };
        Session.prototype.connect = function (url) {
            this.connectedPromise = new goTransport.Promise();
            if (this.socket == null) {
                this.socket = Socket.Adapter.getSocket("SockJSClient", this);
                this.socket.connect(url);
            }
            return this.getConnectedPromise();
        };
        Session.prototype.getConnectedPromise = function () {
            return this.connectedPromise.promise;
        };
        Session.prototype.setPreviousMessage = function (message) {
            console.log('messageManager', 'setPreviousMessage', message.GetId());
            this.messages[message.GetId()] = message;
        };
        Session.prototype.getPreviousMessage = function (message) {
            console.log('messageManager', 'getPreviousMessage', message.GetId(), this.messages[message.GetId()]);
            return this.messages[message.GetId()];
        };
        Session.prototype.connected = function () {
            console.log('connected');
            this.connectedPromise.resolve();
        };
        Session.prototype.Send = function (message) {
            this.getConnectedPromise().then(function () {
                this.socket.send(message);
                console.log('sent', message);
            }.bind(this));
        };
        Session.prototype.messaged = function (data) {
            console.debug('Received: ', data);
            var message = goTransport.Message.unSerialize(data);
            if (!message) {
                console.warn("Invalid message received.");
                return;
            }
            message.Initialize(this);
            var error = message.Received(this.getPreviousMessage(message));
            if (error != null) {
                console.error(error);
            }
        };
        Session.prototype.disconnected = function (code, reason, wasClean) {
            console.warn('Disconnected', code);
            this.currentId = 0;
        };
        return Session;
    }());
    goTransport.Session = Session;
})(goTransport || (goTransport = {}));
var Socket;
(function (Socket) {
    var SockJSClient = (function () {
        function SockJSClient(delegate) {
            this.delegate = delegate;
        }
        SockJSClient.prototype.connect = function (url) {
            if (this.connection) {
                this.close();
            }
            this.url = url;
            this.connection = new SockJS(url);
            this.connection.onopen = this.open.bind(this);
            this.connection.onclose = this.disconnect.bind(this);
            this.connection.onmessage = this.message.bind(this);
        };
        SockJSClient.getInstance = function (delegate) {
            if (!SockJSClient.instance) {
                SockJSClient.instance = new SockJSClient(delegate);
            }
            return SockJSClient.instance;
        };
        SockJSClient.prototype.open = function (e) {
            this.connected = true;
            this.delegate.connected();
        };
        SockJSClient.prototype.disconnect = function (e) {
            if (this.connected) {
                this.delegate.disconnected(e.code, e.reason, e.wasClean);
                this.connected = false;
            }
            if (e.code != 205) {
                setTimeout(function () {
                    this.connect(this.url);
                }.bind(this), 3000);
            }
        };
        SockJSClient.prototype.message = function (e) {
            this.delegate.messaged(e.data);
        };
        SockJSClient.prototype.send = function (data) {
            this.connection.send(data);
        };
        SockJSClient.prototype.close = function () {
            this.connection.close();
        };
        return SockJSClient;
    }());
    Socket.SockJSClient = SockJSClient;
})(Socket || (Socket = {}));
var Socket;
(function (Socket) {
    var Adapter = (function () {
        function Adapter() {
        }
        Adapter.getSocket = function (type, delegate) {
            switch (type) {
                case "SockJSClient":
                    return Socket.SockJSClient.getInstance(delegate);
                default:
                    throw ("Invalid socket type:" + type);
            }
        };
        return Adapter;
    }());
    Socket.Adapter = Adapter;
})(Socket || (Socket = {}));
//# sourceMappingURL=goTransport-client.js.map