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
        <h1 className="text-xl font-bold text-[#f0e4dc]">Department access</h1>
        <p className="text-sm text-[#9e8878] mt-1">
          People only see boards tagged with a department they&apos;ve been granted, plus any
          untagged boards. Grant departments below.
        </p>
      </div>

      <div className="grid gap-3">
        {users.map((u) => (
          <form
            key={u.id}
            action={updateUserAccessAction}
            className="bg-[#1a1210] border border-[#3d2820] rounded-xl p-4"
          >
            <input type="hidden" name="userId" value={u.id} />
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <span className="font-semibold text-[#f0e4dc]">{u.name ?? u.email}</span>
                <span className="text-[#5c4840] text-sm ml-2">{u.email}</span>
              </div>
              {u.isOwner && (
                <span className="text-xs rounded-full bg-[#c4857a]/10 text-[#c4857a] border border-[#c4857a]/30 px-2 py-0.5 font-semibold uppercase tracking-wide">
                  Owner · sees everything
                </span>
              )}
            </div>
            {!u.isOwner && (
              <>
                <div className="flex flex-wrap gap-3">
                  {TAG_OPTIONS.map((tag) => (
                    <label key={tag} className="flex items-center gap-1.5 text-sm text-[#9e8878]">
                      <input
                        type="checkbox"
                        name="tags"
                        value={tag}
                        defaultChecked={u.allowedTags.includes(tag)}
                        className="accent-[#c4857a]"
                      />
                      {TAG_LABEL[tag]}
                    </label>
                  ))}
                </div>
                <button className="mt-3 text-sm bg-[#c4857a] text-[#0d0908] font-bold rounded-lg px-3 py-1.5 hover:bg-[#d4958a] transition-colors">
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
