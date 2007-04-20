/**
 * Copyright (c) 2007 Kelvin Luck (http://www.kelvinluck.com/)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) 
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * $Id$
 **/

(function($){
    
	$.fn.extend({
		/**
		 * Render a calendar table into any matched elements
		 *
		 * @param Object s (optional) Customize your calendars
		 * @option Number month The month to render (NOTE that months are zero based). Default is today's month.
		 * @option Number year The year to render. Default is today's year.
		 * @option Function renderCallback A reference to a function that is called as each cell is rendered and which can add classes and event listeners to the created nodes. Default is no callback.
		 * @option Number showHeader Whether or not to show the header row, possible values are: $.dpConst.SHOW_HEADER_NONE (no header), $.dpConst.SHOW_HEADER_SHORT (first letter of each day) and $.dpConst.SHOW_HEADER_LONG (full name of each day). Default is $.dpConst.SHOW_HEADER_SHORT.
		 **/
		renderCalendar  :   function(s)
		{
			s = $.extend(
				{
					month			: null,
					year			: null,
					renderCallback	: null,
					showHeader		: $.dpConst.SHOW_HEADER_SHORT,
					dpController	: null
				}
				, s
			);
			
			if (s.showHeader != $.dpConst.SHOW_HEADER_NONE) {
				var headRow = $('<tr></tr>');
				for (var i=Date.firstDayOfWeek; i<Date.firstDayOfWeek+7; i++) {
					var weekday = i%7;
					var day = Date.dayNames[weekday];
					headRow.append(
						jQuery("<th></th>").attr({'scope':'col', 'abbr':day, 'title':day, 'class':(weekday == 0 || weekday == 6 ? 'weekend' : 'weekday')}).html(s.showHeader == $.dpConst.SHOW_HEADER_SHORT ? day.substr(0, 1) : day)
					);
				}
			}
			
			var calendarTable = $("<table></table>")
									.attr(
										{
											'cellspacing':2,
											'className':'jCalendar'
										}
									)
									.append(
										(s.showHeader != $.dpConst.SHOW_HEADER_NONE ? 
											$("<thead></thead>")
												.append(headRow)
											:
											'<thead></thead>'
										)
									);
			var tbody = $('<tbody></tbody>');
			
			var today = (new Date()).zeroTime();
			
			var month = s.month == undefined ? today.getMonth() : s.month;
			var year = s.year || today.getFullYear();
			
			var currentDate = new Date(year, month, 1);
			
			
			var firstDayOffset = Date.firstDayOfWeek - currentDate.getDay() + 1;
			if (firstDayOffset > 1) firstDayOffset -= 7;
			currentDate.addDays(firstDayOffset-1);
			
			var w = 0;
			while (w++<6) {
				var r = jQuery("<tr></tr>");
				for (var i=0; i<7; i++) {
					var thisMonth = currentDate.getMonth() == month;
					var d = $('<td>' + currentDate.getDate() + '</td>')
								.attr('className', (thisMonth ? 'current-month ' : 'other-month ') +
													(currentDate.isWeekend() ? 'weekend ' : 'weekday ') +
													(thisMonth && currentDate.getTime() == today.getTime() ? 'today ' : '')
								)
							;
					if (s.renderCallback) {
						s.renderCallback(d, currentDate, month, year);
					}
					r.append(d);
					currentDate.addDays(1);
				}
				tbody.append(r);
			}
			calendarTable.append(tbody);
			
			return this.each(
				function()
				{
					$(this).empty().append(calendarTable);
				}
			);
		},
		
		datePicker : function(s)
		{			
			if (!$.event._dpCache) $.event._dpCache = [];
			
			// initialise the date picker controller with the relevant settings...
			s = $.extend(
				{
					month				: undefined,
					year				: undefined,
					startDate			: undefined,
					endDate				: undefined,
					renderCallback		: [],
					createButton		: true,
					showYearNavigation	: true,
					closeOnSelect		: true,
					displayClose		: false,
					selectMultiple		: false,
					clickInput			: false,
					verticalPosition	: $.dpConst.POS_TOP,
					horizontalPosition	: $.dpConst.POS_LEFT,
					verticalOffset		: 0,
					horizontalOffset	: 0
				}
				, s
			);
			
			return this.each(
				function()
				{
					var $this = $(this);
					
					if (!this._dpId) {
						this._dpId = $.event.guid++;
						$.event._dpCache[this._dpId] = new DatePicker(this);
					}
					
					var controller = $.event._dpCache[this._dpId];
					
					controller.init(s);
					
					if (s.createButton) {
						// create it!
						$this.after(
							$('<a href="#" class="dp-choose-date" title="' + $.dpText.TEXT_CHOOSE_DATE + '">' + $.dpText.TEXT_CHOOSE_DATE + '</a>')
								.bind(
									'click',
									function()
									{
										$this.dpDisplay(this);
										this.blur();
										return false;
									}
								)
						);
					}
					
					if ($this.is(':text')) {
						$this
							.bind(
								'dateSelected',
								function(e, selectedDate, $td)
								{
									this.value = selectedDate.asString();
								}
							).bind(
								'change',
								function()
								{
									var d = Date.fromString(this.value);
									if (d) {
										controller.setSelected(d, true, true);
									}
								}
							);
						if (s.clickInput) {
							$this.bind(
								'click',
								function()
								{
									$this.dpDisplay();
								}
							);
						}
					}
					
					$this.addClass('dp-applied');
					
				}
			)
		},
		
		dpSetStartDate : function(d)
		{
			return _w.call(this, 'setStartDate', d);
		},
		dpSetEndDate : function(d)
		{
			return _w.call(this, 'setEndDate', d);
		},
		dpSetSelected : function(d, v, m)
		{
			if (v == undefined) v=true;
			if (m == undefined) m=true;
			return _w.call(this, 'setSelected', d, v, m);
		},
		dpSetDisplayedMonth : function(m, y)
		{
			return _w.call(this, 'setDisplayedMonth', Number(m), Number(y));
		},
		dpDisplay : function(e)
		{
			return _w.call(this, 'display', e);
		},
		dpSetRenderCallback : function(a)
		{
			return _w.call(this, 'setRenderCallback', a);
		},
		dpSetPosition : function(v, h)
		{
			return _w.call(this, 'setPosition', v, h);
		},
		dpSetOffset : function(v, h)
		{
			return _w.call(this, 'setOffset', v, h);
		},
		// private function called on unload to clean up any expandos etc and prevent memory links...
		_dpDestroy : function()
		{
			// TODO - implement this?
		}
	});
	
	// private internal function to cut down on the amount of code needed where we forward
	// dp* methods on the jQuery object on to the relevant DatePicker controllers...
	var _w = function(f, a1, a2, a3)
	{
		return this.each(
			function()
			{
				var c = _getController(this);
				if (c) {
					c[f](a1, a2, a3);
				}
			}
		);
	}
	
	function DatePicker(ele)
	{
		this.ele = ele;
		
		// initial values...
		this.displayedMonth		=	null;
		this.displayedYear		=	null;
		this.startDate			=	null;
		this.endDate			=	null;
		this.showYearNavigation	=	null;
		this.closeOnSelect		=	null;
		this.displayClose		=	null;
		this.selectMultiple		=	null;
		this.verticalPosition	=	null;
		this.horizontalPosition	=	null;
		this.verticalOffset		=	null;
		this.horizontalOffset	=	null;
		this.renderCallback		=	[];
		this.selectedDates		=	{};
	}
	$.extend(
		DatePicker.prototype,
		{	
			init : function(s)
			{
				this.setStartDate(s.startDate);
				this.setEndDate(s.endDate);
				this.setDisplayedMonth(Number(s.month), Number(s.year));
				this.setRenderCallback(s.renderCallback);
				this.showYearNavigation = s.showYearNavigation;
				this.closeOnSelect = s.closeOnSelect;
				this.displayClose = s.displayClose;
				this.selectMultiple = s.selectMultiple;
				this.verticalPosition = s.verticalPosition;
				this.horizontalPosition = s.horizontalPosition;
				this.setOffset(s.verticalOffset, s.horizontalOffset);
			},
			setStartDate : function(d)
			{
				if (d) {
					this.startDate = Date.fromString(d);
				}
				if (!this.startDate) {
					this.startDate = (new Date()).zeroTime();
				}
				this.setDisplayedMonth(this.displayedMonth, this.displayedYear);
			},
			setEndDate : function(d)
			{
				if (d) {
					this.endDate = Date.fromString(d);
				}
				if (!this.endDate) {
					this.endDate = (new Date('12/31/2999')); // using the JS Date.parse function which expects mm/dd/yyyy
				}
				if (this.endDate.getTime() < this.startDate.getTime()) {
					this.endDate = this.startDate;
				}
				this.setDisplayedMonth(this.displayedMonth, this.displayedYear);
			},
			setPosition : function(v, h)
			{
				this.verticalPosition = v;
				this.horizontalPosition = h;
			},
			setOffset : function(v, h)
			{
				this.verticalOffset = parseInt(v) || 0;
				this.horizontalOffset = parseInt(h) || 0;
			},
			setDisplayedMonth : function(m, y)
			{
				if (this.startDate == undefined || this.endDate == undefined) {
					return;
				}
				var s = new Date(this.startDate.getTime());
				s.setDate(1);
				var e = new Date(this.endDate.getTime());
				e.setDate(1);
				
				var t;
				
				if (isNaN(m) && isNaN(y)) {
					// no month or year passed - default to current month
					t = new Date().zeroTime();
					t.setDate(1);
				} else if (isNaN(m)) {
					// just year passed in - presume we want the displayedMonth
					t = new Date(y, this.displayedMonth, 1);
				} else if (isNaN(y)) {
					// just month passed in - presume we want the displayedYear
					t = new Date(this.displayedYear, m, 1);
				} else {
					// year and month passed in - that's the date we want!
					t = new Date(y, m, 1)
				}
				
				// check if the desired date is within the range of our defined startDate and endDate
				if (t.getTime() < s.getTime()) {
					t = s;
				} else if (t.getTime() > e.getTime()) {
					t = e;
				}
				this.displayedMonth = t.getMonth();
				this.displayedYear = t.getFullYear();
			},
			setSelected : function(d, v, moveToMonth)
			{
				if (this.selectMultiple == false) {
					this.selectedDates = {};
				}
				if (moveToMonth) {
					this.setDisplayedMonth(d.getMonth(), d.getFullYear());
				}
				this.selectedDates[d.getTime()] = v;
			},
			isSelected : function(t)
			{
				return this.selectedDates[t];
			},
			getSelected : function()
			{
				var r = [];
				for(t in this.selectedDates) {
					if (this.selectedDates[t] == true) {
						r.push(new Date(Number(t)));
					}
				}
				return r;
			},
			display : function(eleAlignTo)
			{
				eleAlignTo = eleAlignTo || this.ele;
				var c = this;
				var $ele = $(eleAlignTo);
				var eleOffset = $ele.offset();
				
				
				var _checkMouse = function(e)
				{
					var el = e.target;
					var cal = $('#dp-popup')[0];
					while (true){
						if (el == cal) {
							return true;
						} else if (el == document) {
							c._closeCalendar();
							return false;
						} else {
							el = $(el).parent()[0];
						}
					}
				};
				this._checkMouse = _checkMouse;
				
				this._closeCalendar(true);
				
				$('body')
					.append(
						$('<div></div>')
							.attr('id', 'dp-popup')
							.css(
								{
									'top'	:	eleOffset.top + c.verticalOffset,
									'left'	:	eleOffset.left + c.horizontalOffset
								}
							)
							.append(
								$('<h2></h2>'),
								$('<div id="dp-nav-prev"></div>')
									.append(
										$('<a id="dp-nav-prev-year" href="#" title="' + $.dpText.TEXT_PREV_YEAR + '">&lt;&lt;</a>')
											.bind(
												'click',
												function()
												{
													return c._displayNewMonth.call(c, this, 0, -1);
												}
											),
										$('<a id="dp-nav-prev-month" href="#" title="' + $.dpText.TEXT_PREV_MONTH + '">&lt;</a>')
											.bind(
												'click',
												function()
												{
													return c._displayNewMonth.call(c, this, -1, 0);
												}
											)
									),
								$('<div id="dp-nav-next"></div>')
									.append(
										$('<a id="dp-nav-next-year" href="#" title="' + $.dpText.TEXT_NEXT_YEAR + '">&gt;&gt;</a>')
											.bind(
												'click',
												function()
												{
													return c._displayNewMonth.call(c, this, 0, 1);
												}
											),
										$('<a id="dp-nav-next-month" href="#" title="' + $.dpText.TEXT_NEXT_MONTH + '">&gt;</a>')
											.bind(
												'click',
												function()
												{
													return c._displayNewMonth.call(c, this, 1, 0);
												}
											)
									),
								$('<div></div>')
									.attr('id', 'dp-calendar')
							)
							.bgIframe()
						);
					
				var $pop = $('#dp-popup');
				
				if (this.showYearNavigation == false) {
					$('#dp-nav-prev-year, #dp-nav-next-year').css('display', 'none');
				}
				if (this.displayClose) {
					$pop.append(
						$('<a href="#" id="dp-close">' + $.dpText.TEXT_CLOSE + '</a>')
							.bind(
								'click',
								function()
								{
									c._closeCalendar();
									return false;
								}
							)
					);
				}
				c._renderCalendar();
				
				if (this.verticalPosition == $.dpConst.POS_BOTTOM) {
					$pop.css('top', eleOffset.top + $ele.height() - $pop.height() + c.verticalOffset);
				}
				if (this.horizontalPosition == $.dpConst.POS_RIGHT) {
					$pop.css('left', eleOffset.left + $ele.width() - $pop.width() + c.horizontalOffset);
				}
				
				$(document).bind('mousedown', this._checkMouse);
			},
			setRenderCallback : function(a)
			{
				if (a && typeof(a) == 'function') {
					a = [a];
				}
				this.renderCallback = this.renderCallback.concat(a);
			},
			cellRender : function ($td, thisDate, month, year) {
				var c = this.dpController;
				var d = new Date(thisDate.getTime());
				
				// add our click handlers to deal with it when the days are clicked...
				
				$td.bind(
					'click',
					function()
					{
						var $this = $(this);
						if (!$this.is('.disabled')) {
							c.setSelected(d, !$this.is('.selected') || !c.selectMultiple);
							var s = c.isSelected(d.getTime());
							$(c.ele).trigger('dateSelected', [d, $td, s]);
							if (c.closeOnSelect) {
								c._closeCalendar();
							} else {
								$this[s ? 'addClass' : 'removeClass']('selected');
							}
						}
					}
				);
				
				if (c.isSelected(d.getTime())) {
					$td.addClass('selected');
				}
				
				// call any extra renderCallbacks that were passed in
				for (var i=0; i<c.renderCallback.length; i++) {
					c.renderCallback[i].apply(this, arguments);
				}
				
				
			},
			// ele is the clicked button - only proceed if it doesn't have the class disabled...
			// m and y are -1, 0 or 1 depending which direction we want to go in...
			_displayNewMonth : function(ele, m, y) 
			{
				if (!$(ele).is('.disabled')) {
					this.setDisplayedMonth(this.displayedMonth + m, this.displayedYear + y);
					this._clearCalendar();
					this._renderCalendar();
				}
				ele.blur();
				return false;
			},
			_renderCalendar : function()
			{
				// set the title...
				$('#dp-popup h2').html(Date.monthNames[this.displayedMonth] + ' ' + this.displayedYear);
				
				// render the calendar...
				$('#dp-calendar').renderCalendar(
					{
						month			: this.displayedMonth,
						year			: this.displayedYear,
						renderCallback	: this.cellRender,
						dpController	: this
					}
				);
				
				// update the status of the control buttons and disable dates before startDate or after endDate...
				// TODO: When should the year buttons be disabled? When you can't go forward a whole year from where you are or is that annoying?
				if (this.displayedYear == this.startDate.getFullYear() && this.displayedMonth == this.startDate.getMonth()) {
					$('#dp-nav-prev-year').addClass('disabled');
					$('#dp-nav-prev-month').addClass('disabled');
					$('#dp-calendar td.other-month').each(
						function()
						{
							var $this = $(this);
							if (Number($this.text()) > 20) {
								$this.addClass('disabled');
							}
						}
					);
					var d = this.startDate.getDate();
					$('#dp-calendar td.current-month').each(
						function()
						{
							var $this = $(this);
							if (Number($this.text()) < d) {
								$this.addClass('disabled');
							}
						}
					);
				} else {
					$('#dp-nav-prev-year').removeClass('disabled');
					$('#dp-nav-prev-month').removeClass('disabled');
					var d = this.startDate.getDate();
					if (d > 20) {
						// check if the startDate is last month as we might need to add some disabled classes...
						var sd = new Date(this.startDate.getTime());
						sd.addMonths(1);
						if (this.displayedYear == sd.getFullYear() && this.displayedMonth == sd.getMonth()) {
							$('#dp-calendar td.other-month').each(
								function()
								{
									var $this = $(this);
									if (Number($this.text()) < d) {
										$this.addClass('disabled');
									}
								}
							);
						}
					}
				}
				if (this.displayedYear == this.endDate.getFullYear() && this.displayedMonth == this.endDate.getMonth()) {
					$('#dp-nav-next-year').addClass('disabled');
					$('#dp-nav-next-month').addClass('disabled');
					$('#dp-calendar td.other-month').each(
						function()
						{
							var $this = $(this);
							if (Number($this.text()) < 14) {
								$this.addClass('disabled');
							}
						}
					);
					var d = this.endDate.getDate();
					$('#dp-calendar td.current-month').each(
						function()
						{
							var $this = $(this);
							if (Number($this.text()) > d) {
								$this.addClass('disabled');
							}
						}
					);
				} else {
					$('#dp-nav-next-year').removeClass('disabled');
					$('#dp-nav-next-month').removeClass('disabled');
					var d = this.endDate.getDate();
					if (d < 13) {
						// check if the endDate is next month as we might need to add some disabled classes...
						var ed = new Date(this.endDate.getTime());
						ed.addMonths(-1);
						if (this.displayedYear == ed.getFullYear() && this.displayedMonth == ed.getMonth()) {
							$('#dp-calendar td.other-month').each(
								function()
								{
									var $this = $(this);
									if (Number($this.text()) > d) {
										$this.addClass('disabled');
									}
								}
							);
						}
					}
				}
				
			},
			_closeCalendar : function(programatic)
			{
				$(document).unbind('mousedown', this._checkMouse);
				this._clearCalendar();
				$('#dp-popup a').unbind();
				$('#dp-popup').empty().remove();
				if (!programatic) {
					$(this.ele).trigger('dpClosed', [this.getSelected()]);
				}
			},
			// empties the current dp-calendar div and makes sure that all events are unbound
			// and expandos removed to avoid memory leaks...
			_clearCalendar : function()
			{
				// TODO.
				$('#dp-calendar td').unbind();
				$('#dp-calendar').empty();
			}
		}
	);
	
	// static constants
	$.dpConst = {
		SHOW_HEADER_NONE	:	0,
		SHOW_HEADER_SHORT	:	1,
		SHOW_HEADER_LONG	:	2,
		POS_TOP				:	0,
		POS_BOTTOM			:	1,
		POS_LEFT			:	0,
		POS_RIGHT			:	1
	}
	// localisable text
	$.dpText = {
		TEXT_PREV_YEAR		:	'Previous year',
		TEXT_PREV_MONTH		:	'Previous month',
		TEXT_NEXT_YEAR		:	'Next year',
		TEXT_NEXT_MONTH		:	'Next month',
		TEXT_CLOSE			:	'Close',
		TEXT_CHOOSE_DATE	:	'Choose date'
	}
	// version
	$.dpVersion = '$Id$';

	function _getController(ele)
	{
		if (ele._dpId) return $.event._dpCache[ele._dpId];
		return false;
	}
	
	// make it so that no error is thrown if bgIframe plugin isn't included (allows you to use conditional
	// comments to only include bgIframe where it is needed in IE without breaking this plugin).
	if ($.fn.bgIframe == undefined) {
		$.fn.bgIframe = function() {return this; };
	}


	// clean-up
	$(window)
		.bind('unload', function() {
			var els = $.event._dpCache || [];
			for (var i in els) {
				$(els[i].ele)._dpDestroy();
			}
		});
		
	
})(jQuery);
