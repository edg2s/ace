/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2010, Ajax.org B.V.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

define(function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var Mirror = require("../worker/mirror").Mirror;
var Linter = require("./javascript/eslint").Linter;
var config = require("./javascript/eslint").config;

var types = {
    // 'error' is reserved for fatal (parsing) errors
    // ESLint 'error'& 'warning' are mapped to 'warning' & 'info' respectively
    '1': 'info',
    '2': 'warning'
};

var JavaScriptWorker = exports.JavaScriptWorker = function(sender) {
    Mirror.call(this, sender);
    this.setTimeout(500);
    this.setOptions();
};

oop.inherits(JavaScriptWorker, Mirror);

(function() {
    this.setOptions = function(options) {
        this.options = options || {};
        this.doc.getValue() && this.deferredUpdate.schedule(100);
    };

    this.changeOptions = function(newOptions) {
        oop.mixin(this.options, newOptions);
        this.doc.getValue() && this.deferredUpdate.schedule(100);
    };

    this.isValidJS = function(str) {
        try {
            // evaluated code can only create variables in this function
            eval("throw 0;" + str);
        } catch(e) {
            if (e === 0)
                return true;
        }
        return false;
    };

    this.onUpdate = function() {
        var value = this.doc.getValue();
        value = value.replace(/^#!.*\n/, "\n");
        if (!value)
            return this.sender.emit("annotate", []);

        var errors = new Linter().verify(
            value,
            config
        ).map(function(error) {
            return {
                row: error.line-1,
                column: error.column-1,
                text: error.message + ' (' + error.ruleId + ')',
                type: error.fatal ? 'error' : types[error.severity]
            };
        });

        // console.log("lint time: " + (new Date() - start));

        this.sender.emit("annotate", errors);
    };

}).call(JavaScriptWorker.prototype);

});
