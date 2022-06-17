let { auth } = require("../../validators");
const {
  signUpValidator,
  loginValidator,
  resetValidator,
  newPasswordValidator,
} = auth;

const routes = {
  signUp: `/sign-up`,
  logIn: `/log-in`,
  reset: `/reset`,
  confirmEmail: "/confirm-email",
  newPassword: `/new-password`,
  logOut: `/logout`,
};
class BaseRouting {
  constructor(router, controller) {
    this.router = router;

    this.router
      .route(routes.signUp)
      .get((req, res, next) => controller.getSignUp(req, res, next))
      .post(signUpValidator, (req, res, next) =>
        controller.postSignUp(req, res, next)
      );
    this.router.route(`${routes.confirmEmail}/:token`).get((req, res, next) => {
      controller.confirmEmail(req, res, next);
    });
    this.router
      .route(routes.logIn)
      .get((req, res, next) => {
        controller.getLogin(req, res, next);
      })
      .post(
        loginValidator,
        (req, res, next) => controller.postLogin(req, res, next),
        (req, res, next) => controller.initializeSession(req, res, next)
      );

    this.router
      .route(routes.reset)
      .get((req, res, next) => controller.getReset(req, res, next))
      .post(resetValidator, (req, res, next) =>
        controller.postReset(req, res, next)
      );

    this.router
      .get(`${routes.newPassword}/:token`, (req, res, next) =>
        controller.getNewPassword(req, res, next)
      )
      .post(routes.newPassword, newPasswordValidator, (req, res, next) =>
        controller.postNewPassword(req, res, next)
      );
    this.router.get(routes.logOut, (req, res, next) =>
      controller.logout(req, res, next)
    );
  }
  getRouter() {
    return this.router;
  }

  /**
   *
   * @param {string} route- the routes as a string
   * @param {a tyriad function} middlewares-all the middlewares that will be appended before
   * the controller method is added to the router.get().if there are no middleware pass two arguements and
   * router will work just fine.
   * @param {a tyriad function} controllerMethod-the controller method that will be invoked finally.
   */
  addGet(route, middlewares = [], controllerMethod) {
    this.router.get(route, middlewares, (req, res, next) =>
      controllerMethod(req, res, next)
    );
    return this;
  }
  addGetAndPostForARoute(
    route,
    getMiddlewares = [],
    getControllerMethod,
    postMiddlewares = [],
    postControllerMethod
  ) {
    this.router
      .route(route)
      .get(getMiddlewares, (req, res, next) =>
        getControllerMethod(req, res, next)
      )
      .post(postMiddlewares, (req, res, next) =>
        postControllerMethod(req, res, next)
      );
    return this;
  }
  addPost(route, middlewares = [], controllerMethod) {
    this.router.post(route, middlewares, (req, res, next) =>
      controllerMethod(req, res, next)
    );
    return this;
  }
  addPut(route, middlewares = [], controllerMethod) {
    this.router.put(route, middlewares, (req, res, next) =>
      controllerMethod(req, res, next)
    );
    return this;
  }
}
module.exports = BaseRouting;
