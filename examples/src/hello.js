import { h, attach } from '../..';

let name = '';

let Hello = () => <div>
  <p>Name: <input value={name} oninput={e => name = e.target.value} /></p>
  <p>Hello {name}!</p>
</div>;

attach(document.body, <Hello />);
