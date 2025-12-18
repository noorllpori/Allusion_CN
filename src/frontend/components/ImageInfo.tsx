import fse from 'fs-extra';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';

import { formatDateTime, humanFileSize } from 'common/fmt';
import { IconSet } from 'widgets/icons';
import { Toolbar, ToolbarButton } from 'widgets/toolbar';
import { RendererMessenger } from '../../ipc/renderer';
import { useStore } from '../contexts/StoreContext';
import { ClientFile } from '../entities/File';
import { usePromise } from '../hooks/usePromise';
import ExternalLink from './ExternalLink';
import { AppToaster } from './Toaster';

import i18n from '../../i18n';
// import { useTranslation } from 'react-i18next';

type CommonMetadata = {
  name: string;
  dimensions: string;
  size: string;
  imported: string;
  created: string;
  modified: string;
};

type ExifField = { label: string; modifiable?: boolean; format?: (val: string) => ReactNode };

// Details: https://www.vcode.no/web/resource.nsf/ii2lnug/642.htm
const exifFields: Record<string, ExifField> = {
  PhotometricInterpretation: { label: i18n.t('imageinfo.ColorMode') },
  BitsPerSample: { label: i18n.t('imageinfo.BitDepth') },
  Software: { label: i18n.t('imageinfo.CreationSoftware'), modifiable: true },
  Artist: { label: i18n.t('imageinfo.Creator'), modifiable: true },
  CreatorWorkURL: {
    label: i18n.t('imageinfo.CreatorURL'),
    modifiable: true,
    format: function CreatorURL(url?: string) {
      if (!url) {
        return ' ';
      }
      return <ExternalLink url={url}>{url}</ExternalLink>;
    },
  },
  ImageDescription: { label: i18n.t('imageinfo.Description'), modifiable: true },
  Parameters: { label: 'Parameters' },
  Copyright: { label: i18n.t('imageinfo.Copyright'), modifiable: true },
  Make: { label: 'Camera Manufacturer' },
  Model: { label: 'Camera Model' },
  Megapixels: { label: i18n.t('imageinfo.Megapixels') },
  ExposureTime: { label: 'Exposure Time' },
  FNumber: { label: 'F-stop' },
  FocalLength: { label: 'Focal Length' },
  GPSLatitude: { label: 'GPS Latitude' },
  GPSLongitude: { label: 'GPS Longitude' },
};

const exifTags = Object.keys(exifFields);

const stopPropagation = (e: React.KeyboardEvent<HTMLInputElement>) => e.stopPropagation();

interface ImageInfoProps {
  file: ClientFile;
}

const ImageInfo = ({ file }: ImageInfoProps) => {
  const commonMetadataLabels: Record<keyof CommonMetadata, string> = {
    name: i18n.t('imageinfo.Filename'),
    dimensions: i18n.t('imageinfo.Dimensions'),
    size: i18n.t('imageinfo.Size'),
    imported: i18n.t('imageinfo.Imported'),
    created: i18n.t('imageinfo.Created'),
    modified: i18n.t('imageinfo.Modified'),
  };

  const { exifTool } = useStore();

  const [isEditing, setIsEditing] = useState(false);

  const modified = usePromise(file.absolutePath, async (filePath) => {
    const stats = await fse.stat(filePath);
    return formatDateTime(stats.ctime);
  });

  const fileStats: CommonMetadata = {
    name: file.name,
    dimensions: `${file.width || '?'} x ${file.height || '?'}`,
    size: humanFileSize(file.size),
    imported: formatDateTime(file.dateAdded),
    created: formatDateTime(file.dateCreated),
    modified: modified.tag === 'ready' && 'ok' in modified.value ? modified.value.ok : '...',
  };

  const [exifStats, setExifStats] = useState<Record<string, string>>({});
  useEffect(() => {
    // When the file changes, update the exif stats
    setIsEditing(false);
    // Reset previous fields to empty string, so the re-render doesn't flicker as when setting it to {}
    setExifStats(
      Object.entries(exifStats).reduce(
        (acc, [key, val]) => ({ ...acc, [key]: val ? ' ' : '' }),
        {},
      ),
    );

    exifTool.readExifTags(file.absolutePath, exifTags).then((tagValues) => {
      const stats: Record<string, string> = {};
      tagValues.forEach((val, i) => {
        const key = exifTags[i];
        stats[key] = val || '';
      });
      setExifStats(stats);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file.absolutePath]);

  const handleEditSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const form = e.currentTarget as HTMLFormElement;

      const data: Record<string, string> = {};
      const newExifStats = { ...exifStats };
      for (const [key, field] of Object.entries(exifFields)) {
        if (field.modifiable) {
          const value = (form.elements.namedItem(key) as HTMLInputElement).value;
          if (value) {
            // Set value to store in exif data
            data[key] = value;

            // Update data for in view, lil bit hacky
            newExifStats[key] = value;
          }
        }
      }

      setIsEditing(false);
      setExifStats(newExifStats);

      // TODO: also update filename here?

      // TODO: this doesn't update the modified time of the file. Maybe it should? See ExifIO internals
      exifTool
        .writeData(file.absolutePath, data)
        .then(() => AppToaster.show({ message: 'Image file saved!', timeout: 3000 }))
        .catch((err) => {
          AppToaster.show({
            message: 'Could not save image file',
            clickAction: { label: 'View', onClick: RendererMessenger.toggleDevTools },
            timeout: 6000,
          });
          console.error('Could not update file', err);
        });
    },
    [exifStats, exifTool, file.absolutePath],
  );

  // Todo: Would be nice to also add tooltips explaining what these mean (e.g. diff between dimensions & resolution)
  // Or add the units: pixels vs DPI
  return (
    <form onSubmit={handleEditSubmit} onReset={() => setIsEditing(false)}>
      <header>
        <h2>{i18n.t('imageinfo.Information')}</h2>
        <Toolbar controls="file-info" isCompact>
          {isEditing ? (
            <>
              <ToolbarButton
                key="cancel"
                icon={IconSet.CLOSE}
                text="Cancel"
                tooltip="Cancel changes"
                type="reset"
              />
              <ToolbarButton
                key="submit"
                icon={IconSet.SELECT_CHECKED}
                text="Save"
                tooltip="Save changes"
                type="submit"
              />
            </>
          ) : (
            <ToolbarButton
              key="edit"
              icon={IconSet.EDIT}
              text="Edit"
              onClick={() => setIsEditing(true)}
              tooltip="Edit Exif data"
              type="button"
            />
          )}
        </Toolbar>
      </header>
      <table id="file-info">
        <tbody>
          {Object.entries(commonMetadataLabels).map(([field, label]) => (
            <tr key={field}>
              <th scope="row">{label}</th>
              <td>{fileStats[field as keyof CommonMetadata]}</td>
            </tr>
          ))}
          {Object.entries(exifFields).map(([key, field]) => {
            const value = exifStats[key];
            const isEditingMode = isEditing && field.modifiable;
            if (!value && !isEditingMode) {
              return null;
            }
            return (
              <tr key={key}>
                <th scope="row">{field.label}</th>

                <td>
                  {!isEditingMode ? (
                    field.format?.(value || '') || value
                  ) : (
                    <input defaultValue={value || ''} name={key} onKeyDown={stopPropagation} />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </form>
  );
};

export default React.memo(ImageInfo);
