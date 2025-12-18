import React from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '../../contexts/StoreContext';
import FileTags from '../../components/FileTag';
import ImageInfo from '../../components/ImageInfo';
import { IconButton, IconSet } from 'widgets';
import { shell } from 'electron';
import { IS_PREVIEW_WINDOW } from 'common/window';

import i18n from 'src/i18n';

const Inspector = observer(() => {
  const { uiStore, fileStore } = useStore();

  if (uiStore.firstItem >= fileStore.fileList.length || !uiStore.isInspectorOpen) {
    return (
      <aside id="inspector">
        <Placeholder />
      </aside>
    );
  }

  const first = fileStore.fileList[uiStore.firstItem];
  const path = first.absolutePath;

  return (
    <aside id="inspector">
      <section>
        <ImageInfo file={first} />
      </section>
      <section>
        <header>
          <h2>{i18n.t('Inspector.Pathtofile')}</h2>
        </header>
        <div className="input-file">
          <input readOnly className="input input-file-value" value={path} />
          <IconButton
            icon={IconSet.FOLDER_CLOSE}
            onClick={() => shell.showItemInFolder(path)}
            text={i18n.t('Openinfileexplorer')}
          />
        </div>
      </section>
      {/* Modifying state in preview window is not supported (not in sync updated in main window) */}
      {!IS_PREVIEW_WINDOW && (
        <section>
          <header>
            <h2>Tags</h2>
          </header>
          <FileTags file={first} />
        </section>
      )}
    </aside>
  );
});

export default Inspector;

const Placeholder = () => {
  return (
    <section>
      <header>
        <h2>未选择图片</h2>
      </header>
    </section>
  );
};
