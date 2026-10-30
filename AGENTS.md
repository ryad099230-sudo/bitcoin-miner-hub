<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep deposit input validation and explorer selection in `src/lib/deposits.ts`; shared pure rules enable concrete safety tests.
- Keep the deposit workflow in `src/components/app/Deposit.tsx` and use the existing connected client; never silently switch financial backends.
- Deposit verification sends only the owned request ID and transaction hash to the existing verifier; re-read the owned database row before reflecting confirmation and refreshing balance queries.
- Enforce confirmation prerequisites and hash uniqueness in database triggers/indexes as well as UI validation, so privileged RPC paths cannot bypass financial invariants.
