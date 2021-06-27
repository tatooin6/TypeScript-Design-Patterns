function createObserver() {
    var listeners = [];
    return {
        subscribe: function (listener) {
            listeners.push(listener);
            return function () {
                listeners = listeners.filter(function (l) { return l !== listener; });
            };
        },
        publish: function (event) {
            listeners.forEach(function (l) { return l(event); });
        }
    };
}
// Factory Pattern
function createDatabase() {
    var InMemoryDataBase = /** @class */ (function () {
        function InMemoryDataBase() {
            this.db = {};
            this.beforeAddListeners = createObserver();
            this.afterAddListeners = createObserver();
        }
        InMemoryDataBase.prototype.set = function (newValue) {
            this.beforeAddListeners.publish({
                newValue: newValue,
                value: this.db[newValue.id]
            });
            this.db[newValue.id] = newValue;
            this.afterAddListeners.publish({
                value: newValue
            });
        };
        InMemoryDataBase.prototype.get = function (id) {
            return this.db[id];
        };
        InMemoryDataBase.prototype.onBeforeAdd = function (listener) {
            return this.beforeAddListeners.subscribe(listener);
        };
        InMemoryDataBase.prototype.onAfterAdd = function (listener) {
            return this.afterAddListeners.subscribe(listener);
        };
        InMemoryDataBase.instance = new InMemoryDataBase();
        return InMemoryDataBase;
    }());
    // Singleton
    // const db = new InMemoryDataBase();
    // return db
    return InMemoryDataBase;
}
var PokemonDB = createDatabase();
var unsubscribe = PokemonDB.instance.onAfterAdd(function (_a) {
    var value = _a.value;
    console.log(value);
});
PokemonDB.instance.set({
    id: 'Bulbasaur',
    attack: 50,
    defense: 10
});
unsubscribe();
PokemonDB.instance.set({
    id: 'Spinosaur',
    attack: 50,
    defense: 10
});
// console.log(PokemonDB.instance.get('Bulbasaur'));
