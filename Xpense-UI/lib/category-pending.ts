/** Pass newly created category id back to transaction form without remounting the screen. */
let pendingCategoryId: number | null = null;

export function setPendingCategoryId(categoryId: number) {
  pendingCategoryId = categoryId;
}

export function takePendingCategoryId(): number | null {
  const id = pendingCategoryId;
  pendingCategoryId = null;
  return id;
}
