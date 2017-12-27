import { h, attach } from '../..';

let fruits = ['Apple', 'Banana', 'Cherry'];

let ListItem = {
  render({fruit, index}) {
    return this.isEditing 
      ? <li>
          <form onsubmit={e => { if (!this.isCancel) fruits[index] = this.value; this.isEditing = false; e.preventDefault(); }}>
            <input value={this.value} oninput={e => this.value = e.target.value} autofocus/>
            {' '}
            <button>Save</button>
            {' '}
            <button onclick={() => { this.isCancel = true; }}>Cancel</button>
          </form>
        </li>
      : <li>
          <p>{fruit}</p>
          <p>
            <button onclick={() => { this.value = fruit; this.isEditing = true; }}>Edit</button>
            {' '}
            <button onclick={() => fruits.splice(index, 1)}>Remove</button>
          </p>
        </li>;
  }
};

let name = '';

let List = () => <div>
  <form onsubmit={e => { fruits.push(name); e.preventDefault(); }}>
    <input oninput={e => name = e.target.value} autofocus />
  </form>
  <ul>
    {fruits.map((fruit, index) => <ListItem fruit={fruit} index={index} />)}
  </ul>
</div>;

attach(document.body, <List />);
