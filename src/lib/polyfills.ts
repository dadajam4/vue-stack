if (typeof document !== 'undefined' && !document.scrollingElement) {
  let judged = false;
  let element: Element | null = null;
  const scrollingElement = () => {
    if (judged) return element;

    if (!document.documentElement) return element;

    if (document.body.scrollTop) {
      judged = true;
      return (element = document.body);
    }

    const iframe = document.createElement('iframe');
    iframe.style.height = '1px';
    document.documentElement.appendChild(iframe);

    if (!iframe.contentWindow) return element;
    const doc = iframe.contentWindow.document;
    doc.write('<!DOCTYPE html><div style="height:9999em">x</div>');
    doc.close();
    if (!doc.documentElement) return element;
    const isCompliant =
      doc.documentElement.scrollHeight > doc.body.scrollHeight;
    (iframe.parentNode as Node & ParentNode).removeChild(iframe);
    judged = true;
    return (element = isCompliant ? document.documentElement : document.body);
  };
  Object.defineProperty(document, 'scrollingElement', {
    get: scrollingElement,
  });
}
