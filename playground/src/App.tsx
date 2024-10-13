import './App.css';
import { Textarea } from './components/Textarea';
import { CodeMirrorEditor } from './components/CodeMirrorEditor';

export function App() {
  return (
    <>
      <h2 style={{ 'text-align': 'center' }}>📎 Inline Attacher</h2>

      <main>
        <Textarea />

        <br />
        <hr />

        <CodeMirrorEditor />
      </main>

      <footer style={{ 'text-align': 'right', 'margin-top': '2rem' }}>
          <a href="https://github.com/EastSun5566/inline-attacher" target="_blank" rel="noreferrer">
            <em>repo</em>
          </a>
      </footer>
    </>
  );
}

export default App;
