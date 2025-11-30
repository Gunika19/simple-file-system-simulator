// const express = require('express');
// const asyncHandler = require('./asyncHandler');

// // Store metadata about controllers and routes
// const controllerMetadata = new Map();

// // Controller decorator
// function Controller(basePath = '') {
//   return function(target) {
//     target._isController = true;
//     target._basePath = basePath;
//     target._routes = target._routes || [];
//     controllerMetadata.set(target.name, {
//       class: target,
//       basePath,
//       routes: target._routes
//     });
//     return target;
//   };
// }

// // Service decorator
// function Service() {
//   return function(target) {
//     target._isService = true;
//     return target;
//   };
// }

// // Route method decorators
// function createRouteDecorator(method) {
//   return function(path = '/', middlewares = []) {
//     return function(target, propertyKey, descriptor) {
//       const originalMethod = descriptor.value;
      
//       if (!target.constructor._routes) {
//         target.constructor._routes = [];
//       }
      
//       target.constructor._routes.push({
//         method,
//         path,
//         handler: propertyKey,
//         middlewares
//       });
      
//       return descriptor;
//     };
//   };
// }

// const Get = createRouteDecorator('get');
// const Post = createRouteDecorator('post');
// const Put = createRouteDecorator('put');
// const Delete = createRouteDecorator('delete');
// const Patch = createRouteDecorator('patch');

// // Function to build routes from controllers
// function buildRoutes(container) {
//   const router = express.Router();
  
//   for (const [controllerName, metadata] of controllerMetadata) {
//     const instanceName = controllerName.charAt(0).toLowerCase() + controllerName.slice(1);
//     const controllerInstance = container.resolve(instanceName);
//     const controllerRouter = express.Router();
    
//     metadata.routes.forEach(route => {
//       const handler = controllerInstance[route.handler].bind(controllerInstance);
//       const wrappedHandler = asyncHandler(handler);
      
//       controllerRouter[route.method](
//         route.path,
//         ...route.middlewares,
//         wrappedHandler
//       );
//     });
    
//     router.use(metadata.basePath, controllerRouter);
//   }
  
//   return router;
// }

// module.exports = {
//   Controller,
//   Service,
//   Get,
//   Post,
//   Put,
//   Delete,
//   Patch,
//   buildRoutes,
//   controllerMetadata
// };


const express = require('express');
const asyncHandler = require('./asyncHandler');

// Store metadata about controllers and routes
const controllerMetadata = new Map();

// Controller decorator
function Controller(basePath = '') {
  return function(target) {
    target._isController = true;
    target._basePath = basePath;
    target._routes = target._routes || [];
    controllerMetadata.set(target.name, {
      class: target,
      basePath,
      routes: target._routes
    });
    return target;
  };
}

// Service decorator
function Service() {
  return function(target) {
    target._isService = true;
    return target;
  };
}

// Route method decorators
function createRouteDecorator(method) {
  return function(path = '/', middlewares = []) {
    // allow passing a single middleware function directly
    if (!Array.isArray(middlewares)) {
      middlewares = [middlewares];
    }

    return function(target, propertyKey, descriptor) {
      const originalMethod = descriptor.value;

      if (!target.constructor._routes) {
        target.constructor._routes = [];
      }

      target.constructor._routes.push({
        method,
        path,
        handler: propertyKey,
        middlewares
      });

      return descriptor;
    };
  };
}

const Get = createRouteDecorator('get');
const Post = createRouteDecorator('post');
const Put = createRouteDecorator('put');
const Delete = createRouteDecorator('delete');
const Patch = createRouteDecorator('patch');

// Function to build routes from controllers
// container: Awilix container (or similar) — used to resolve controller instances and optional middleware by name
function buildRoutes(container) {
  const router = express.Router();

  for (const [controllerName, metadata] of controllerMetadata) {
    const instanceName = controllerName.charAt(0).toLowerCase() + controllerName.slice(1);

    // ensure container can resolve controller
    if (!container || typeof container.resolve !== 'function') {
      throw new Error('A DI container with .resolve() is required to build routes.');
    }

    let controllerInstance;
    try {
      controllerInstance = container.resolve(instanceName);
    } catch (err) {
      throw new Error(`Failed to resolve controller instance "${instanceName}" from container: ${err.message}`);
    }

    const controllerRouter = express.Router();

    metadata.routes.forEach(route => {
      // validate handler exists on instance and is a function
      const handlerFn = controllerInstance[route.handler];
      if (typeof handlerFn !== 'function') {
        throw new TypeError(
          `Route handler "${route.handler}" not found or not a function on controller "${controllerName}". ` +
          `Resolved instance name: "${instanceName}".`
        );
      }

      // normalize and validate middlewares:
      // - if middleware is a function -> keep it
      // - if middleware is a string -> try to resolve from container (useful for named middleware)
      // - otherwise -> throw
      const resolvedMiddlewares = (route.middlewares || []).map((mw, idx) => {
        if (!mw && mw !== 0) { // catch undefined/null
          throw new TypeError(`Middleware at index ${idx} for handler "${route.handler}" on "${controllerName}" is ${mw}`);
        }

        if (typeof mw === 'function') {
          return mw;
        }

        if (typeof mw === 'string') {
          // attempt to resolve from container (commonly useful)
          try {
            const resolved = container.resolve(mw);
            if (typeof resolved !== 'function') {
              throw new TypeError(`Resolved middleware "${mw}" is not a function (controller "${controllerName}", handler "${route.handler}")`);
            }
            return resolved;
          } catch (err) {
            // rethrow with clearer context
            throw new Error(`Failed to resolve middleware "${mw}" from container for controller "${controllerName}", handler "${route.handler}": ${err.message}`);
          }
        }

        throw new TypeError(`Middleware for handler "${route.handler}" on "${controllerName}" must be a function or a container-registered name string. Got: ${typeof mw}`);
      });

      // bind method and wrap with asyncHandler
      const boundHandler = handlerFn.bind(controllerInstance);
      const wrappedHandler = asyncHandler(boundHandler);

      // final sanity check
      if (typeof wrappedHandler !== 'function') {
        throw new TypeError(`Wrapped handler for "${route.handler}" on "${controllerName}" is not a function.`);
      }

      // Register the route
      // route.method should be a valid router method (get/post/put/delete/patch)
      if (typeof controllerRouter[route.method] !== 'function') {
        throw new TypeError(`Invalid HTTP method "${route.method}" used for handler "${route.handler}" on "${controllerName}"`);
      }

      controllerRouter[route.method](
        route.path,
        ...resolvedMiddlewares,
        wrappedHandler
      );
    });

    router.use(metadata.basePath, controllerRouter);
  }

  return router;
}

module.exports = {
  Controller,
  Service,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  buildRoutes,
  controllerMetadata
};
