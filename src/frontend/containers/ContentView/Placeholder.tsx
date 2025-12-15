import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import LOGO_FC from 'resources/logo/svg/full-color/allusion-logomark-fc.svg';
import { IS_PREVIEW_WINDOW } from 'common/window';

import { useStore } from '../../contexts/StoreContext';

const Placeholder = observer(() => {
  const { fileStore, tagStore } = useStore();

  if (IS_PREVIEW_WINDOW) {
    return <PreviewWindowPlaceholder />;
  }
  if (fileStore.showsAllContent && tagStore.isEmpty) {
    // No tags exist, and no images added: Assuming it's a new user -> Show a welcome screen
    return <Welcome />;
  } else if (fileStore.showsAllContent) {
    return <NoContentFound />;
  } else if (fileStore.showsQueryContent) {
    return <NoQueryContent />;
  } else if (fileStore.showsUntaggedContent) {
    return <NoUntaggedContent />;
  } else if (fileStore.showsMissingContent) {
    return <NoMissingContent />;
  } else {
    return <BugReport />;
  }
});

export default Placeholder;

import { IconSet, Button, ButtonGroup, SVG } from 'widgets';
import { RendererMessenger } from 'src/ipc/renderer';
import useMountState from 'src/frontend/hooks/useMountState';

const PreviewWindowPlaceholder = observer(() => {
  const { fileStore } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [, isMounted] = useMountState();
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileStore.fileListLastModified]);

  if (isLoading) {
    return (
      <ContentPlaceholder title="Loading..." icon={<SVG src={LOGO_FC} />}>
        {IconSet.LOADING}
      </ContentPlaceholder>
    );
  }

  // There should always be images to preview.
  // If the placeholder is shown, something went wrong (probably the DB of the preview window is out of sync with the main window)
  return (
    <ContentPlaceholder title="That's not supposed to happen..." icon={<SVG src={LOGO_FC} />}>
      <p>Something went wrong while previewing the selected images</p>

      <div className="divider" />

      <Button
        styling="outlined"
        text="Reload Allusion"
        onClick={() => RendererMessenger.reload()}
      />
    </ContentPlaceholder>
  );
});

const Welcome = () => {
  const { uiStore } = useStore();
  return (
    <ContentPlaceholder title="欢迎来到  爱鹿寻" icon={<SVG src={LOGO_FC} />}>
      <p>
        Allusion是一款专为整理视觉素材库而设计的工具，助您在创作过程中轻松找到所需内容。
      </p>
      <p>
        Allusion需要知道在哪里找到你的图片。
        <br />
        添加位置以开始使用。
      </p>

      <div className="divider" />

      <p>首次使用 Allusion?</p>
      <Button styling="outlined" text="打开帮助中心" onClick={uiStore.toggleHelpCenter} />

      <br />
      <br />
      <br />

      {/* Mention principles (?) */}
      <small>Allusion是一款只读应用程序。我们绝不会触碰您的文件。</small>
    </ContentPlaceholder>
  );
};

const NoContentFound = () => {
  const { uiStore } = useStore();
  return (
    <ContentPlaceholder title="无图片" icon={IconSet.MEDIA}>
      <p>图片可从大纲视图中添加</p>
      <Button onClick={uiStore.toggleOutliner} text="Toggle outliner" styling="outlined" />
    </ContentPlaceholder>
  );
};

const NoQueryContent = () => {
  const { fileStore } = useStore();
  return (
    <ContentPlaceholder title="未找到图片" icon={IconSet.SEARCH}>
      <p>请尝试搜索其他内容。</p>
      {/* TODO: when search includes a Hidden tag, remind the user that's what might be causing them to see no results */}
      <ButtonGroup align="center">
        <Button
          text="所有图片"
          icon={IconSet.MEDIA}
          onClick={fileStore.fetchAllFiles}
          styling="outlined"
        />
        <Button
          text="未标记"
          icon={IconSet.TAG_BLANCO}
          onClick={fileStore.fetchUntaggedFiles}
          styling="outlined"
        />
      </ButtonGroup>
    </ContentPlaceholder>
  );
};

const NoUntaggedContent = () => {
  const { fileStore } = useStore();
  return (
    <ContentPlaceholder title="No untagged images" icon={IconSet.TAG}>
      <p>All images have been tagged. Nice work!</p>
      <Button
        text="所有图片"
        icon={IconSet.MEDIA}
        onClick={fileStore.fetchAllFiles}
        styling="outlined"
      />
    </ContentPlaceholder>
  );
};

const NoMissingContent = () => {
  const { fileStore } = useStore();
  return (
    <ContentPlaceholder title="No missing images" icon={IconSet.WARNING_BROKEN_LINK}>
      <p>Try searching for something else.</p>
      <ButtonGroup align="center">
        <Button
          text="所有图片"
          icon={IconSet.MEDIA}
          onClick={fileStore.fetchAllFiles}
          styling="outlined"
        />
        <Button
          text="未标记"
          icon={IconSet.TAG_BLANCO}
          onClick={fileStore.fetchUntaggedFiles}
          styling="outlined"
        />
      </ButtonGroup>
    </ContentPlaceholder>
  );
};

const BugReport = () => {
  return (
    <ContentPlaceholder title="你遇到了一个错误！" icon={IconSet.WARNING_FILL}>
      <p>请向维护者报告此错误!</p>
    </ContentPlaceholder>
  );
};

interface IContentPlaceholder {
  icon: JSX.Element;
  title: string;
  children: React.ReactNode | React.ReactNodeArray;
}

const ContentPlaceholder = (props: IContentPlaceholder) => {
  return (
    <div id="content-placeholder">
      <span className="custom-icon-128">{props.icon}</span>
      <h2 className="dialog-title">{props.title}</h2>
      {props.children}
    </div>
  );
};
