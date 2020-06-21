function StatelessFunctionalComponent({
  isActive,
  onFiltersUpdated,
  onSelect,
  onSubmitAndDeselect,
  onCancel,
  searchFilters,
  title,
  items,
}) {
  return <div />
}

function StatelessFunctionalComponent({
  isActive = true,
  onFiltersUpdated = () => null,
  onSelect = () => null,
  onSubmitAndDeselect = () => null,
  onCancel = () => null,
  searchFilters = null,
  title = '',
  items = [],
} = {}) {
  return <div />
}

function StatelessFunctionalComponent(
  {
    isActive,
    onFiltersUpdated = () => null,
    onSelect = () => null,
    onSubmitAndDeselect = () => null,
    onCancel = () => null,
    searchFilters = null,
    title = '',
    items = [],
  } = {
    isActive: true
  }
) {
  return <div />
}

function StatelessFunctionalComponent({
  isActive,
  onFiltersUpdated,
  onSelect,
  onSubmitAndDeselect,
  onCancel,
  searchFilters,
  title,
  items,
}: MyType | null | void) {
  return <div />
}

const StatelessFunctionalComponent = ({
  isActive,
  onFiltersUpdated,
  onSelect,
  onSubmitAndDeselect,
  onCancel,
  searchFilters,
  title,
  items,
}: {
  isActive: number,
  onFiltersUpdated: number,
  onSelect: number,
  onSubmitAndDeselect: number,
  onCancel: number,
  searchFilters: number,
  title: number,
  items: number,
}) => {
  return <div />
};

class C {
  StatelessFunctionalComponent({
    isActive,
    onFiltersUpdated,
    onSelect,
    onSubmitAndDeselect,
    onCancel,
    searchFilters,
    title,
    items,
  }) {
    return <div />
  }
}

type T = ({
  isActive: number,
  onFiltersUpdated: number,
  onSelect: number,
  onSubmitAndDeselect: number,
  onCancel: number,
  searchFilters: number,
  title: number,
  items: number,
}) => void;

const X = (props: {
  a: boolean,
}) =>
  <A />;
