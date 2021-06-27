
// Observer
type Listener<EventType> = (ev: EventType) => void;
function createObserver<EventType>(): {
  subscribe: (listener: Listener<EventType>) => () => void;
  publish: (event: EventType) => void;
} {
  let listeners: Listener<EventType>[] = [];
  return {
    subscribe: (listener: Listener<EventType>): () => void => {
      listeners.push(listener)
      return () => {
        listeners = listeners.filter(l => l!== listener)
      }
    }, 
    publish: (event: EventType) => {
      listeners.forEach( (l) => l(event) );
    }
  }
}

interface BeforeSetEvent<T> {
  value: T;
  newValue: T;
}

interface AfterSetEvent<T> {
  value: T;
}

interface Pokemon {
  id: string;
  attack: number;
  defense: number;
}

interface BaseRecord {
  id: string;
}

interface Database<T extends BaseRecord> {
  set(newValue: T): void
  get(id: string): T | undefined

  onBeforeAdd(listener: Listener<BeforeSetEvent<T>>): () => void;
  onAfterAdd(listener: Listener<BeforeSetEvent<T>>): () => void;
}

// Factory Pattern
function createDatabase<T extends BaseRecord>() {
  class InMemoryDataBase implements Database<T> {
    private db: Record<string, T> = {};

    static instance: InMemoryDataBase = new InMemoryDataBase();

    private beforeAddListeners = createObserver<BeforeSetEvent<T>>();
    private afterAddListeners = createObserver<AfterSetEvent<T>>();

    private constructor() {}

    public set(newValue: T): void {
      this.beforeAddListeners.publish({
        newValue,
        value: this.db[newValue.id]
      });
       
      this.db[newValue.id] = newValue;

      this.afterAddListeners.publish({
        value: newValue,
      });
    }
    public get(id: string): T {
      return this.db[id]
    }
    
    onBeforeAdd(listener: Listener<BeforeSetEvent<T>>): () => void {
      return this.beforeAddListeners.subscribe(listener);
    }
    onAfterAdd(listener: Listener<BeforeSetEvent<T>>): () => void {
      return this.afterAddListeners.subscribe(listener);
    }

  }

  // Singleton
  // const db = new InMemoryDataBase();
  // return db
  return InMemoryDataBase;
}

const PokemonDB = createDatabase<Pokemon>();

const unsubscribe = PokemonDB.instance.onAfterAdd(({value}) => {
  console.log(value)
})

PokemonDB.instance.set({
  id: 'Bulbasaur',
  attack: 50,
  defense: 10,
});

unsubscribe();

PokemonDB.instance.set({
  id: 'Spinosaur',
  attack: 50,
  defense: 10,
});

// console.log(PokemonDB.instance.get('Bulbasaur'));
