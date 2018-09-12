const GID_REGEXP = /\/(\w+(-\w+)*)$/;

export function parseGid(gid: string): string {
  // appends forward slash to help identify invalid id
  const id = `/${gid}`;
  const matches = id.match(GID_REGEXP);
  if (matches && matches[1] !== undefined) {
    return matches[1];
  }
  throw new Error(`Invalid gid: ${gid}`);
}

export function composeGid(key: string, id: number | string): string {
  return `gid://shopify/${key}/${id}`;
}
