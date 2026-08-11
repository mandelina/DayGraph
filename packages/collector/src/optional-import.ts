export async function importOptionalModule<T>(specifier: string): Promise<T> {
  const dynamicImport = new Function("specifier", "return import(specifier)");
  return dynamicImport(specifier) as Promise<T>;
}
