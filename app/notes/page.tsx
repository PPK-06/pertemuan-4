// REFERENCE IMPLEMENTATION (bukan fitur SRS, tidak dipegang siapa pun).
// WAJIB ditiru polanya: Server Component, requireUser() di baris pertama,
// data dari lib/queries, form dari components/<domain>.
import NoteForm from "@/components/notes/note-form";
import DeleteNoteButton from "@/components/notes/delete-note-button";
import { getNotes } from "@/lib/queries/note";
import { requireUser } from "@/lib/session";

export default async function NotesPage() {
  await requireUser();
  const notes = await getNotes();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Catatan (contoh)</h1>
      <NoteForm />
      {notes.length === 0 ? (
        <p className="text-sm text-gray-500">Belum ada catatan.</p>
      ) : (
        <ul className="divide-y rounded border">
          {notes.map((note) => (
            <li key={note.id} className="flex items-center justify-between px-4 py-2">
              <span>{note.judul}</span>
              <DeleteNoteButton id={note.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
