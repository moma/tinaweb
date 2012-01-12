#
# default settings - uncomment any line to change the default value
# please keep in mind that users (browsers) can change theses values
# by using url parameters, like index.html?search=optics
#
default_config = 
  element: "#tinaviz"        # canvas element 
  gexf: "sample.gexf.gz"     # gexf file to load by default
  embed: false               # if set to true, the config.getGraph function will be called. else, config.gexf will be called
#  view: "macro"             # default view to show the graph
  category: "Document"       # default category used to show the graph
#  node_id: ""               # default node to select ("" means no node will be selected)
#  search: ""                # default search query ("" means no search will be run)
#  a_node_size: 0.50         # node size for category A
#  b_node_size: 0.50         # node size for category B
#  cursor_size: 0.01         # default selection cursor size
#  a_edge_filter_min: 0.0    # initial position of the edge filter for category A (lower-bound)
#  a_edge_filter_max: 1.0    # initial position of the edge filter for category A (higher-bound)
#  a_node_filter_min: 0.0    # initial position of the edge filter for category A (lower-bound)
#  a_node_filter_max: 1.0    # initial position of the edge filter for category A (higher-bound)
#  b_edge_filter_min: 0.0    # initial position of the edge filter for category B (lower-bound)
#  b_edge_filter_max: 1.0    # initial position of the edge filter for category B (higher-bound)
#  b_node_filter_min: 0.0    # initial position of the edge filter for category B (lower-bound)
#  b_node_filter_max: 1.0    # initial position of the edge filter for category B (higher-bound)
#  layout: "tinaforce"       # default layout (note: for the moment, only "tinaforce" is recommended)
#  layout_speed: 30          # layout speed (in iterations by seconds)
  pause: false              # should we be paused by default?
  demo: false               # should we enable the demo mode?