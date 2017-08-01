// In order to use relative paths for the Component `templateUrl` and `styleUrls`, we
// need to tell the TypeScript compiler that there is an ambient value "module". This
// way, it won't report errors in every component that uses relative paths.
declare var module: { id: string };
declare var System: any;
declare var require: any;