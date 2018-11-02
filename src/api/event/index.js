import {Router} from 'express';
import event from '../../models/events';
import venue from '../../models/venue';


export default ({config, db}) => {
    let api = Router();
    const eventModel = event(db.sequelize, db.Sequelize);
    const venueModel = venue(db.sequelize, db.Sequelize);
    
    api.get('/', (req, res) => {

       var country = req.query.country;
       var state = req.query.state;

        venueModel.findAll({
            where: {
                country: country,
                state: state
            }
        }) 
        .then(event => {
            res.json(event);
        });
    });
    
    api.get('/:index', function(req,res) {

       var idx = req.params.index;
        eventModel.findOne({
            where: {
                index: idx
            }
        })
        .then(event => {
            res.json(event);
        });
        
        
        /*    
        
        eventModel.findOne({
            where: {
                country: params.country
            }
        }).then(facet => {
            if (facet != null) {
                res.json(facet);
            } else {
                res.status(404).send("Not Found");
            }
        });
      */  
    });
    

    return api;
};