var _ = require('lodash');

module.exports = {
	getNumber: function(data){
		return data.issue.number;
	},
	before: 'Thanks for the issue report! To make sure issues are handled quickly, we use a simple checklist for you to fill out.
                 Before a real human comes by, please make sure your report has all the below criteria checked',
	after: 'Please make sure you also read [contribution guide](https://github.com/RuudBurger/CouchPotatoServer/blob/develop/contributing.md#issues) and followed all the steps. \n' +
		'Make the title describe your issue. Having "SR not working" or "I get this bug" for 100 issues, isn\'t really helpful. We will close issues if there isn\'t enough information.' +
		'Sometimes the devs may seem like a grunt and respond with short answers. This isn\'t (always) because the dev hates you, but because he\'s on mobile or busy fixing bugs. If something isn\'t clear, please let us know, and this bot may get updated to automatically answer you.' +
		'\n\nThanks!',
	checks: [

		// Fill in the dots
		{
			message: 'Fill in all the dots. They\'re there for a reason',
			condition: function (data) {
				var body = data.issue.body.toLowerCase();

				var is_sr_log = 1;
				_.each(['information:', 'reproduce:', 'logs:'], function(check_for){
					is_sr_log += _.contains(body, check_for) ? 1 : 0;
				});

				var forgot_filled_in = _.contains(data.issue.body, ': ...');

				return is_cp_log && !forgot_filled_in;
			}
		},

		// Post logs
		{
			message: 'Post logs, either inline (for smaller logs) or using gist)',
			condition: function (data) {

				var inline_logs = isInlineLog(data.issue.body);

				var linked_logs = 0;
				_.each(['pastebin.com', 'gist.github.com'], function(check_for){
					linked_logs += _.contains(data.issue.body.toLowerCase(), check_for) ? 1 : 0;
				});

				return inline_logs || linked_logs;
			}
		},

		// Wrap inline logs inside ```
		{
			message: 'Please wrap inline logs inside ``` for readability',
			condition: function (data) {
				var inline_logs = isInlineLog(data.issue.body);

				if(inline_logs)
					return _.contains(data.issue.body, '```');
			}
		},

		// Enable debugging
		{
			message: 'Enable debug logging (be sure to disable after the bug is fixed)',
			condition: function (data) {
				var inline_logs = isInlineLog(data.issue.body);
				if(inline_logs)
					return _.contains(data.issue.body, 'DEBUG [');
			}
		},

		// Version information missing
		{
			message: 'Post full version information',
			condition: function (data) {

				var has_version = _.contains(data.issue.body, 'Branch'),
					is_desktop = false,
					correct_repo = false;

				// Make sure logs are from correct repo
				// if(has_version){
				//correct_repo = _.contains(data.issue.body, 'SiCKRAGETV:');
				// }

				return correct_repo || is_desktop;
			}
		}

	]

}

function isInlineLog(data){
	var inline_logs = 0;
	_.each(['ERROR [', 'INFO [', 'DEBUG ['], function(check_for){
		inline_logs += _.contains(data, check_for) ? 1 : 0;
	});

	return inline_logs > 0;
}
