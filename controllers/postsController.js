exports.getPosts = async (req, res) => {
     const {page} = req.query;
     const postsPerPage = 10;

     try {
        let pageNum = 0;
        if(pageNum <= 1) {
            pageNum = 0;
        } else {
            pageNum = page - 1;
        }
     } catch (error) {
        console.log(error);
        
     }
    
}