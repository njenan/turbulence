/**
 * A variable holder that can be injected into any function that supports injection.  It is used to share variables
 * between virtual users and test plans.  Variables can be attached like any normal JS object
 * (e.g. Global.myCustomVariable = 'MyValue';)
 */
export class Global {
    static Global = {};
}
