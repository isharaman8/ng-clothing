<script lang="ts">
	// third party imports
	import _ from 'lodash';

	// inner imports
	import { STATUS_COLOR } from '../../../constants';

	// props
	export let status: string;

	// variables
	let statusName = _.capitalize(_.join(_.split(status, '_'), ' '));
	let colors = _.join(_.values(STATUS_COLOR[status] || {}), ' ');
</script>

<div class={`rounded-xl text-sm px-2 py-3 text-center ${colors}`}>{statusName}</div>
