/// <reference path="../typings/angularjs/angular.d.ts" />
module goTransport {
    "use strict";

    export class Angular1 extends Client{

        constructor($q : IQService) {
            Promise.$q = $q;
            super();
        }

        public static getInstance($q : IQService): Client {
            if(!Angular1.instance)
                Angular1.instance = new Angular1($q);
            return Angular1.instance;
        }

    }

    //Attach the above to angular
    "use strict";
    angular
        .module("goTransport", ['bd.sockjs']);
    angular
        .module("goTransport")
        .factory("goTransport", ["$q", Angular1.getInstance]);
}