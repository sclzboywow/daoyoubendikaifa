import { InkButton } from '@app/components/ui/InkButton';
import { InkDetailDrawer } from '@app/components/ui/InkDetailDrawer';
import { InkTag } from '@app/components/ui/InkTag';
import {
  getWanxiEnabledBindings,
  getWanxiLocation,
  type WanxiPropDefinition,
} from '@shared/engine/wanxi';

const CATEGORY_LABEL = {
  world: '世界物件',
  memory: '记忆物件',
  social: '社交物件',
  puzzle: '解谜物件',
  activity: '活动物件',
} as const;

export function WanxiPropDetailDrawer(props: {
  prop: WanxiPropDefinition;
  enabledActivityBindingIds: readonly string[];
  busy?: boolean;
  onClose(): void;
  onActivitySelect?(bindingId: string): void;
}) {
  const location = getWanxiLocation(props.prop.locationId);
  const options = getWanxiEnabledBindings({
    propId: props.prop.id,
    enabledIds: props.enabledActivityBindingIds,
  });

  return (
    <InkDetailDrawer
      isOpen
      onClose={props.onClose}
      title={props.prop.name}
      description={props.prop.description}
      size="sm"
      closeLabel="继续逛逛"
      footer={
        options.length ? (
          <div className="space-y-2">
            {options.map((binding) => (
              <InkButton
                key={binding.id}
                className="w-full justify-start"
                variant="secondary"
                disabled={props.busy}
                pending={props.busy}
                onClick={() => props.onActivitySelect?.(binding.id)}
              >
                {binding.label}
              </InkButton>
            ))}
          </div>
        ) : undefined
      }
    >
      <div className="space-y-4">
        <p className="text-ink-secondary text-sm leading-7">
          所在：
          <span className="text-ink">
            {location?.name ?? props.prop.locationId}
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          <InkTag tone="neutral" variant="outline">
            {CATEGORY_LABEL[props.prop.category]}
          </InkTag>
        </div>
        {options.length === 0 ? (
          <p className="text-ink-secondary text-sm leading-6">
            今天它只是安静地待在这里。并不是每个物件每天都必须触发内容。
          </p>
        ) : null}
      </div>
    </InkDetailDrawer>
  );
}
