import './App.css';
import { Textarea } from './components/Textarea';
import { CodeMirrorEditor } from './components/CodeMirrorEditor';

export function App() {
  return (
    <>
      <h1>📎 Inline Attacher</h1>

      <Textarea />

      <br />
      <hr />

      <CodeMirrorEditor />
    </>
  );
}

export default App;
