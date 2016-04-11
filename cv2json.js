function cv2json(d) {
    var regexps = [
        // #+BEGIN_LATEX
        {r: /#\+BEGIN_.*/, name: 'begin_src'}, 

        // #+END_LATEX
        {r: /#\+END_.*/, name: 'end_src'},

        // # a comment
        {r: /#.*/, name: 'ignore'},

        // # * Work Experiencew
        {r: /(\*+)\s+(.*)/, name: 'level'},

        // # - Chalmers :: /2008 -- current/
        {r: /\-\s+(.*)\s+\:\:\s+\/(.*)\s--\s(.*)\//, name: 'list_item'},

        // .*
        {r: /(.*)/, name: 'content'},
    ];
    
    var data = []; 

    var in_src_block = false;
    d.split('\n').forEach(function(line) {
        regexps.some(function(exp) {
            
            var match = exp.r.exec(line.trim());
            if(!match || match[0] == "") return false;

            switch (exp.name) {
            case 'begin_src':
                in_src_block = true;
                break;

            case 'end_src':
                in_src_block = false;
                break;
            }

            if(in_src_block) return true;

            switch (exp.name) {
            case 'ignore':
                break;
            case 'level':
                data.push({
                    level: match[1].length,
                    name: match[2],
                    d: [],
                    description: ""
                });
                break;

            case 'list_item':
                var format = 'YYYY-MMM';
                var stop = match[3] == 'current' ? new Date() : moment(match[3], format).toDate();
                data[data.length-1].d.push({
                    start: moment(match[2],format).toDate(),
                    stop: stop,
                    title: match[1],
                    description: "",
                });
                break;

            case 'content':
                // convert org-mode font-types to html
                html = line.trim()
                    .replace(/(http.*?).+|\/(.*?)\//g, function(str,m0) {
                        if(m0 == 'http')
                            return '<a href="' + str + '">' + str + '</a>'
                        else
                            return '<b>' + str.substring(1, str.length - 1) + '</b>'
                    });
                

                d0 = data[data.length-1];
                d1 = d0.d;
                if(d1.length == 0) d0.description += ('\n ' + html);
                else {
                    d = d1[d1.length-1];
                    if(d) d.description += ('\n' + html);
                }
                break;

            default:
                break;
            };
            
            return true;
        })
    });

    var result = {};
    data.forEach(function(d) {
        result[d.name] = d;
    });
    
    return result;
}
