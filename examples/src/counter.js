import { h, attach } from '../..';

let counter = 0;

let Counter = () => <div>
  <p>Counter: {counter}</p>
  <p>
    <button onclick={() => counter++}>+</button>
    {' '}
    <button onclick={() => counter--}>-</button>
  </p>
</div>;

attach(document.body, <Counter />);
