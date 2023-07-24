export function generate_unique_id(prefix : string) : string {
    return prefix + '_' + Date.now().toString()
}