import { observer } from 'mobx-react-lite';
import React, { useCallback } from 'react';

import { Row } from 'widgets';
import { IconSet } from 'widgets/icons';
import { Menu, useContextMenu } from 'widgets/menus';
import { FileTagMenuItems } from '../containers/ContentView/menu-items';
import { useStore } from '../contexts/StoreContext';
import { ClientFile } from '../entities/File';
import { ClientTag } from '../entities/Tag';
import { TagSelector } from './TagSelector';

import { MenuButton, MenuItem } from 'widgets/menus';

interface IFileTagProp {
  file: ClientFile;
}

const QuickEdit = observer(({ file }: IFileTagProp) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)', // 一行两个按钮
        gap: 8, // 横纵间距
      }}
    >
      <MenuItem
        icon={IconSet.RELOAD}
        text="顺时针 90°"
        onClick={() => console.log('rotate cw', file)}
      />

      <MenuItem
        icon={IconSet.RELOAD_COMPACT}
        text="逆时针 90°"
        onClick={() => console.log('rotate ccw', file)}
      />

      <MenuItem
        icon={IconSet.SORT_ALT}
        text="左右翻转"
        onClick={() => console.log('flip horizontal', file)}
      />

      <MenuItem
        icon={IconSet.SORT}
        text="上下翻转"
        onClick={() => console.log('flip vertical', file)}
      />
      
      <MenuItem
        icon={IconSet.INFO}
        text="测试"
        onClick={() => {
          console.log('file:', file);
          console.log('snapshot:', { ...file });
        }}
      />
    </div>
  );
});

export default QuickEdit;