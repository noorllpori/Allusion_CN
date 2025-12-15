import React, { RefObject, memo, useState } from 'react';

import { IconButton } from 'widgets/button';
import { IconSet } from 'widgets/icons';
import { InfoButton } from 'widgets/notifications';
import { KeySelector, OperatorSelector, ValueInput } from './Inputs';
import { QueryDispatch } from './QueryEditor';
import { defaultQuery, generateCriteriaId } from './data';

export interface QueryBuilderProps {
  keySelector: RefObject<HTMLSelectElement>;
  dispatch: QueryDispatch;
}

const CriteriaBuilder = memo(function QueryBuilder({ keySelector, dispatch }: QueryBuilderProps) {
  const [criteria, setCriteria] = useState(defaultQuery('tags'));

  const add = () => {
    dispatch((query) => new Map(query.set(generateCriteriaId(), criteria)));
    setCriteria(defaultQuery('tags'));
    keySelector.current?.focus();
  };

  return (
    <fieldset aria-labelledby="criteria-builder-label">
      <legend id="criteria-builder-label">
        标准构建器 Criteria Builder
        <InfoButton>
          一个标准由三个组成部分构成：
          <ul>
            <li>
              <b>条件 key</b> (图像文件的属性),
            </li>
            <li>
              <b>操作器 operator</b> (decides how the property value is compared) and
            </li>
            <li>
              the matching <b>值 value</b>.
            </li>
          </ul>
          Every image that matches the criteria is shown.
          <br />
          <br />
          You can edit the inputs for each component and add the criteria to the query by pressing
          the{' '}
          <span aria-label="add criteria" style={{ verticalAlign: 'middle' }}>
            {IconSet.ADD}
          </span>{' '}
          icon button next to the inputs.
        </InfoButton>
      </legend>
      <div id="criteria-builder">
        <label id="builder-key">条件 Key</label>
        <label id="builder-operator">操作器 Operator</label>
        <label id="builder-value">值 Value</label>
        <span></span>

        <KeySelector
          labelledby="builder-key"
          ref={keySelector}
          keyValue={criteria.key}
          dispatch={setCriteria}
        />
        <OperatorSelector
          labelledby="builder-operator"
          keyValue={criteria.key}
          value={criteria.operator}
          dispatch={setCriteria}
        />
        <ValueInput
          labelledby="builder-value"
          keyValue={criteria.key}
          value={criteria.value}
          dispatch={setCriteria}
        />
        <IconButton text="Add Criteria" icon={IconSet.ADD} onClick={add} />
      </div>
    </fieldset>
  );
});

export default CriteriaBuilder;
