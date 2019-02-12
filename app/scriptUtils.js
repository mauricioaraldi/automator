var Step = require('./objects/Step.js'),
	webdriver = require('selenium-webdriver'),
	testing = require('selenium-webdriver/testing/assert'),
	By = webdriver.By,
	until = webdriver.until;

/**
 * Retrieve steps from a IDE Script
 *
 * @author mauricio.araldi
 * @since 28/07/2015
 *
 * @parameter String script - Script to be divided into steps
 */
exports.retrieveIDEScriptSteps = function(script) {
	var steps = [];

	script = script.slice(script.indexOf('<tbody>') + 7);

	//While there is a step in the script
	while (script.indexOf('<tr>') > -1) {
		var textStep = script.slice( script.indexOf('<tr>') + 4, script.indexOf('</tr>') );

		//Transform the stepText into step
		steps.push(parseTextStepToStep(textStep.trim()));

		//Remove the step that was just read
		script = script.slice(script.indexOf('</tr>') + 5);
	}

	return steps;
}

/**
 * Reads and executes a step from a Selenium IDE Script
 *
 * @author mauricio.araldi
 * @since 28/07/2015
 *
 * @parameter WebDriver driver - The driver in which execute steps
 * @parameter Step step - Step to execute, from IDE script
 */
exports.executeIDEScriptStep = function(driver, step) {
	switch(step.instruction) {
		case 'assertAlert': 
			return testing(driver.switchTo().alert().getText()).contains(step.target);
			break;

		case 'assertElementPresent':
			return driver.findElement(By.css(parseBySelectorToCss(step.target)));
			break;

		case 'assertText':
			return testing(driver.findElement(By.css(parseBySelectorToCss(step.target))).getText()).equalTo(step.target);
			break;
			
		case 'click':
			return driver.findElement(By.css(parseBySelectorToCss(step.target))).click();
			break;

		case 'clickAndWait':
			this.executeIDEScriptStep(driver, new Step('click', step.target, ''));
			return this.executeIDEScriptStep(driver, new Step('waitForElementPresent', 'tagName=body', ''));
			break;

		case 'keyDown':
			return driver.findElement(By.css(parseBySelectorToCss(step.target))).sendKeys(parseKeys(step.value));
			break;

		case 'keyPress':
			return driver.findElement(By.css(parseBySelectorToCss(step.target))).sendKeys(parseKeys(step.value));
			break;

		case 'keyUp':
			return driver.findElement(By.css(parseBySelectorToCss(step.target))).sendKeys(parseKeys(step.value));
			break;

		case 'open':
			return driver.get(step.target);
			break;

		case 'pause':
			return driver.sleep(step.value);

		case 'selectWindow': 
			return driver.switchTo().window(step.target);
			break;

		case 'type':
			return driver.findElement(By.css(parseBySelectorToCss(step.target))).sendKeys(step.value);
			break;

		case 'waitForCondition':
			return driver.wait(new webdriver.until.Condition("Waiting condition...", step.target), parseInt(step.value));
			break;

		case 'waitForElementPresent':
			return driver.wait(until.elementLocated(By.css(parseBySelectorToCss(step.target))), parseInt(step.value));
			break;

		case 'waitForAttribute':
			return driver.wait(
				function() {
					return driver.findElement(By.css(parseBySelectorToCss(step.target))).then(
						function(result) {
							return result.getAttribute(steps.value).then(
								function(result) {
									return true;
								}
							);
						},
						function(error) {
							return false;
						}
					);
				}, parseInt(step.value));
			break;

		case 'waitForNotAttribute':
			return driver.wait(
				function() {
					return driver.findElement(By.css(parseBySelectorToCss(step.target))).then(
						function(result) {
							return result.getAttribute(step.value).then(
								function(result) {
									if (!result) {
										return true;
									}

									return false;
								}
							);
						},
						function(error) {
							return true;
						}
					);
				}, parseInt(step.value));
			break;

		case 'waitForNotValue':
			return driver.wait(
				function() {
					return driver.findElement(By.css(parseBySelectorToCss(step.target))).then(
						function(result) {
							return result.getAttribute('value').then(
								function(result) {
									if (result != step.value) {
										return true;
									}

									return false;
								}
							);
						},
						function(error) {
							return true;
						}
					);
				}, parseInt(step.value));
			break;

		case 'waitForNotVisible':
			return driver.wait(
				function() {
					return driver.findElement(By.css(parseBySelectorToCss(step.target))).then(
						function(result) {
							return result.isDisplayed().then(
								function(result) {
									return !result;
								}
							);
						},
						function(error) {
							return true;
						}
					);
				}, parseInt(step.value));
			break;

		case 'waitForValue':
			return driver.wait(
				function() {
					return driver.findElement(By.css(parseBySelectorToCss(step.target))).then(
						function(result) {
							return result.getAttribute('value').then(
								function(result) {
									if (result
										&& result == step.value) {
										return true;
									}

									return false;
								}
							);
						},
						function(error) {
							return false;
						}
					);
				}, parseInt(step.value));
			break;

		case 'waitForVisible':
			return driver.wait(
				function() {
					return driver.findElement(By.css(parseBySelectorToCss(step.target))).then(
						function(result) {
							return result.isDisplayed().then(
								function(result) {
									return result;
								}
							);
						},
						function(error) {
							return false;
						}
					);
				}, parseInt(step.value));
			break;

		default:
			console.log('Step not expected:', ' [I] ', step.instruction, ' [T] ', step.target, ' [V] ', step.value);
			break;
	}
}

/**
 * Receives a selector for an element on "By" notation, and parses it to a css selector
 *
 * @author mauricio.araldi
 * @since 30/07/2015
 *
 * @parameter String bySelector - The By selector to be parsed
 */
function parseBySelectorToCss(target) {
	//In case a CSS selector has been directly passed
	if (target.indexOf('=') < 0) {
		return target;
	}

	//Replace &gt;
	target = target.replace(/&gt;/g, '>');

	var by = target.slice(0, target.indexOf('=')),
		selector = target.slice(target.indexOf('=') + 1),
		cssSelectorPrefix, cssSelectorSuffix;

	switch(by) {
		case 'css':
			return selector;
			break;

		case 'class':
			cssSelectorPrefix = '.';
			cssSelectorSuffix = '';
			break;

		case 'id':
			cssSelectorPreffix = '#';
			cssSelectorSuffix = '';
			break;

		case 'name':
			cssSelectorPreffix = '*[name="';
			cssSelectorSuffix = '"]';

			break;

		case 'tagName':
			cssSelectorPrefix = '';
			cssSelectorSuffix = '';
			break;

		default: 
			console.log('By Selector not recognized:', ' [S] ', target);
			break;
	}

	return cssSelectorPreffix + selector + cssSelectorSuffix;
}

/**
 * Receives a textStep in Selenium IDE format and parses it to Step object
 *
 * @author mauricio.araldi
 * @since 28/07/2015
 *
 * @parameter String step - The step to be parsed
 */
function parseTextStepToStep(textStep) {
	var subSteps = textStep.split('\n'),
		instruction, target, value;

	instruction = subSteps[0].slice( subSteps[0].indexOf('<td>') + 4,  subSteps[0].indexOf('</td>'));
	target = subSteps[1].slice( subSteps[1].indexOf('<td>') + 4,  subSteps[1].indexOf('</td>'));
	value = subSteps[2].slice( subSteps[2].indexOf('<td>') + 4,  subSteps[2].indexOf('</td>'));

	return new Step(instruction, target, value);
}

/**
 * Receives a step value in Selenium IDE format and parses it to be proccessed as keys presses.
 * Mainly used to separate raw text from exact keys (SHIFT, ALT, ENTER, etc.).
 *
 * @author mauricio.araldi
 * @since 03/12/2015
 *
 * @parameter String keys - The step value to be parsed
 */
function parseKeys(keys) {
	if (typeof keys == 'String') {
		return keys;
	}

	switch(parseInt(keys)) {
		case 27:
			return webdriver.Key.ESC;
			break;

		case 13:
			return webdriver.Key.ENTER;
			break;

		case 9:
			return webdriver.Key.TAB;
			break;

		default:
			console.log('Key not recognized:', ' [K] ', keys);
			break;
	}
}