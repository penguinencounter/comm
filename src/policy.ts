import wayfinder from "./wayfinder.js";

const DOCUMENT_ROOT = "./documents/"
const POLICY_PATH = "./documents/map.json"

// map.json
interface PolicyItem {
    latest: string
    history: { [key: string]: string }
}

interface PolicyManifest {
    [key: string]: PolicyItem
}

let live_policy_contents: PolicyManifest | null = null

async function fetch_policy(): Promise<PolicyManifest> {
    if (live_policy_contents != null) return live_policy_contents

    const root = await wayfinder()
    const policy = new URL(POLICY_PATH, root)
    const data = await fetch(policy)
    live_policy_contents = await data.json()
    return live_policy_contents!
}

const docid_re = /^(.*?)(?::([^:]*?))?$/m

async function locate_policy(docid: string): Promise<Result<URL>> {
    const pol = await fetch_policy()
    const rem = docid_re.exec(docid)
    if (!rem) return {
        present: false,
        reason: "Invalid document ID format"
    }
    let doc = rem[1], ver = rem[2]

    if (!pol[doc]) return {
        present: false,
        reason: "No matching document found"
    }

    const docket = pol[doc]

    if (!ver) ver = docket.latest
    if (!docket.history[ver]) return {
        present: false,
        reason: "No matching version for this document found"
    }

    const doc_root_resolved = new URL(DOCUMENT_ROOT, await wayfinder())
    return {
        present: true,
        value: new URL(docket.history[ver], doc_root_resolved)
    }
}

export { fetch_policy, locate_policy }

/* policy.html content */

window.addEventListener("DOMContentLoaded", async () => {
    const pol = await fetch_policy();
    document.querySelectorAll(".js-document-id").forEach(async e => {
        const el = <HTMLElement>e
        const docid = el.dataset.doc
        if (!docid) return
        let result: string
        if (!pol[docid]) {
            result = "[no match?!]"
        } else {
            result = `${docid}:${pol[docid].latest}`
        }
        el.innerText = result
    })

    const doc_code_field = <HTMLInputElement>document.getElementById("doc-code");
    const output = <HTMLElement>document.getElementById("locator-errors");

    async function go_to_policy(docid: string) {
        const result = await locate_policy(docid)
        if (!result.present) {
            const reason = result.reason ?? "Failed to locate"
            output.innerText = reason
            output.classList.remove("hidden")
        } else {
            document.location.assign(result.value)
        }
    }

    (<HTMLFormElement>document.getElementById("locator-form")).addEventListener("submit", ev => {
        ev.preventDefault()
        ev.stopPropagation()
        go_to_policy(doc_code_field.value)
    })
})