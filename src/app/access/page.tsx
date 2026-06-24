import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listUsers } from "@/lib/tasks";
import { updateUserAccessAction } from "@/app/actions";

import { TAG_LABEL, TAG_OPTIONS } from "@/lib/tag-styles";

export default async function AccessPage() {
  const session = await auth();
  if (!session?.user) redirect("/");
  if (!session.user.isOwner) redirect("/");

  const users = await listUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-stone-100">Department access</h1>
        <p className="text-sm text-stone-400 mt-1">
          People only see boards tagged with a department they&apos;ve been granted, plus any
          untagged boards. Grant departments below.
        </p>
      </div>

      <div className="grid gap-3">
        {users.map((u) => (
          <form
            key={u.id}
            action={updateUserAccessAction}
            className="bg-[#262420] border border-stone-800 rounded-lg p-4"
          >
            <input type="hidden" name="userId" value={u.id} />
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <span className="font-medium text-stone-100">{u.name ?? u.email}</span>
                <span className="text-stone-500 text-sm ml-2">{u.email}</span>
              </div>
              {u.isOwner && (
                <span className="text-xs rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 px-2 py-0.5 font-semibold uppercase tracking-wide">
                  Owner · sees everything
                </span>
              )}
            </div>
            {!u.isOwner && (
              <>
                <div className="flex flex-wrap gap-3">
                  {TAG_OPTIONS.map((tag) => (
                    <label key={tag} className="flex items-center gap-1.5 text-sm text-stone-300">
                      <input
                        type="checkbox"
                        name="tags"
                        value={tag}
                        defaultChecked={u.allowedTags.includes(tag)}
                        className="accent-stone-300"
                      />
                      {TAG_LABEL[tag]}
                    </label>
                  ))}
                </div>
                <button className="mt-3 text-sm bg-stone-100 text-stone-900 font-medium rounded-md px-3 py-1.5 hover:bg-white transition-colors">
                  Save access
                </button>
              </>
            )}
          </form>
        ))}
      </div>
    </div>
  );
}
