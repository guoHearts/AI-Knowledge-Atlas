import { CmsEditorView } from '@/features/cms/components/CmsEditorView';

export default async function EditorPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;

  return <CmsEditorView slug={slug?.join('/') || ''} />;
}
