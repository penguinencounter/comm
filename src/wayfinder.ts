// helps you find your way
// when absolute paths cannot save you

const SIGNPOST = "signpost.json"

interface Signpost {
    relative_root: string
}

let root: URL | null = null

async function get_content_root(): Promise<URL> {
    if (root != null) return root;
    const resp = await fetch(SIGNPOST)
    const content: Signpost = await resp.json()
    const result = new URL(content.relative_root, document.location.toString())
    root = result
    return result
}

export default get_content_root